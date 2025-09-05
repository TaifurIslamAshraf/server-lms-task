import crypto from "crypto";
import ejs from "ejs";
import { Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import path from "path";
import config from "../../config/config";
import ApiError from "../../errorHandlers/ApiError";
import { createJwtToken, verifyJwtToken } from "../../helpers/jwtHelper";
import { sendMail } from "../../helpers/sendMail";
import { IActivationInfo, IUser } from "../users/user.interface";
import UserModel from "../users/user.model";
import {
  GoogleAuthData,
  GoogleUserInfo,
  TRegisterUser,
} from "./auth.interface";
import {
  accessTokenCookieOptions,
  createActivationToken,
  google,
  refreshTokenCookieOptions,
} from "./auth.utils";

export const getGoogleOAuthData = (): GoogleAuthData => {
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const scopes = ["openid", "profile", "email"];

  return {
    state,
    codeVerifier,
    authUrl: google.createAuthorizationURL(state, codeVerifier, scopes).href,
    scopes: scopes,
  };
};

export const handleGoogleCallback = async (
  code: string,
  codeVerifier: string,
  res: Response
) => {
  // Exchange code for tokens
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  console.log("tokens.accessToken", tokens.accessToken());
  // Get user info from Google
  const googleUser: GoogleUserInfo = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    }
  ).then((res) => {
    if (!res.ok) {
      throw new Error(`Google API error: ${res.status}`);
    }
    return res.json() as Promise<GoogleUserInfo>;
  });

  // Find or create user
  let user = await UserModel.findOne({ email: googleUser.email });

  if (!user) {
    user = await UserModel.create({
      email: googleUser.email,
      fullName: googleUser.name,
      avatar: googleUser.picture,
      isSocialAuth: true,
    });
  }

  const accessToken = user.accessToken();
  const refreshToken = user.refreshToken();

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return user;
};

export const googleAuthVerifyService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};
export class AuthOriginService {
  private allowedOrigins: string[];

  constructor() {
    this.allowedOrigins = config.domains.origin;
  }

  validateOrigin(origin: string): boolean {
    return this.allowedOrigins.includes(origin);
  }

  extractRootDomain = (hostname: string): string => {
    const parts = hostname.split(".");

    if (parts.length > 2) {
      return parts.slice(-2).join(".");
    }

    return hostname;
  };
}

// Register user
export const registerUserService = async (userData: TRegisterUser) => {
  const existingUser = await UserModel.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const { token, activationCode } = createActivationToken(userData);
  const emailTemplatePath = path.join(process.cwd(), "/src/views/mail.ejs");

  await ejs.renderFile(emailTemplatePath, {
    user: { name: userData.fullName },
    activationCode,
  });

  await sendMail({
    email: userData.email,
    subject: "Activate your account",
    templete: "mail.ejs",
    data: {
      user: { name: userData.fullName },
      activationCode,
    },
  });

  return { token };
};

// Activate user
export const activationUserService = async (
  token: string,
  activationCode: string
) => {
  const userData = verifyJwtToken(
    token,
    config.security.mailVarificationTokenSecret
  ) as {
    user: IActivationInfo;
    activationCode: string;
  };

  if (userData.activationCode !== activationCode) {
    throw new ApiError(400, "Invalid Activation Code");
  }

  const isEmailExist = await UserModel.exists({ email: userData.user.email });
  if (isEmailExist) {
    throw new ApiError(400, "Email already exists");
  }

  const user = await UserModel.create(userData.user);
  return user;
};

// Login user
export const loginUserService = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password");
  const isPasswordMatch = user && (await user.comparePassword(password));
  if (!user || !isPasswordMatch) {
    throw new ApiError(400, "Invalid email or password");
  }

  return user;
};

// Social authentication
export const socialAuthService = async (userData: Partial<IUser>) => {
  const user = await UserModel.findOne({ email: userData.email });
  if (!user) {
    const newUser = await UserModel.create({
      ...userData,
      isSocialAuth: true,
    });
    return newUser;
  }

  return user;
};


// Update user info
export const updateUserInfoService = async (
  userId: string,
  updateData: Partial<IUser>
) => {
  if (updateData.email) throw new ApiError(400, "Email cannot be updated");
  const user = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  });
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

// Forgot password
export const forgotPasswordService = async (
  email: string,
  userType: "admin" | "client"
) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email");

  const userId = user._id?.toString();

  const token = createJwtToken(
    { id: user._id, userType },
    config.security.forgotPasswordTokenSecret,
    "15m"
  );

  const forgotPasswordLink = `${config.domains.serverUrl}/api/v1/user/forgot-password-link-validation/${userId}/${token}/${userType}`;

  const emailTemplatePath = path.join(
    process.cwd(),
    "/src/views/forgotMail.ejs"
  );

  await ejs.renderFile(emailTemplatePath, { forgotPasswordLink });

  await sendMail({
    email,
    subject: "Password Reset Request",
    templete: "forgotMail.ejs",
    data: { forgotPasswordLink },
  });
};

// Logout
export const logoutService = async (res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
};

// Get user info service
export const getUserInfoService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

// Update access token service
export const updateAccessTokenService = async (
  refreshToken: string,
  res: Response
) => {
  const decoded: any = verifyJwtToken(
    refreshToken,
    config.security.refreshTokenSecret
  );

  if (!decoded || !decoded._id) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await UserModel.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = createJwtToken(
    { _id: user._id },
    config.security.accessTokenSecret,
    config.jwtExpires.accessTokenExpire!
  );

  const newRefreshToken = createJwtToken(
    { _id: user._id },
    config.security.refreshTokenSecret,
    config.jwtExpires.refreshTokenExpire!
  );

  res.locals.user = user;

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user,
  };
};

// Update password service
export const updatePasswordService = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isSocialAuth) {
    throw new ApiError(400, "Social auth users cannot update password");
  }

  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save();
};

// Validate forgot password link service
export const validateForgotPasswordLinkService = async (
  userId: string,
  token: string
) => {
  if (!userId || !token) {
    throw new ApiError(400, "Invalid password reset link");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const decoded = verifyJwtToken(
    token,
    config.security.forgotPasswordTokenSecret
  );

  if (!decoded) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  return decoded;
};

// Reset password service
export const resetPasswordService = async (
  userId: string,
  token: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isSocialAuth) {
    throw new ApiError(400, "Social auth users cannot reset password");
  }

  const decoded = verifyJwtToken(
    token,
    config.security.forgotPasswordTokenSecret
  );
  if (!decoded) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = newPassword;
  await user.save();
};

// Get all users service
export const getAllUsersService = async () => {
  const users = await UserModel.find().sort({ role: 1 });
  const userCount = await UserModel.countDocuments();

  if (!users.length) {
    throw new ApiError(404, "No users found");
  }

  return {
    users,
    total: userCount,
  };
};

// Update user role service
export const updateUserRoleService = async (userId: string, role: string) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// Delete user service
export const deleteUserService = async (
  targetUserId: string,
  currentUserId: string
) => {
  if (targetUserId === currentUserId) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await UserModel.findByIdAndDelete(targetUserId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
};
