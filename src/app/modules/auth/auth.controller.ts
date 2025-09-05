import { CookieOptions, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config/config";
import ApiError from "../../errorHandlers/ApiError";
import catchAsync from "../../middlewares/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TRegisterUser } from "./auth.interface";
import {activationUserService, AuthOriginService, deleteUserService, forgotPasswordService, getAllUsersService, getGoogleOAuthData, getUserInfoService, googleAuthVerifyService, handleGoogleCallback, loginUserService, logoutService, registerUserService, resetPasswordService, socialAuthService, updateAccessTokenService, updatePasswordService, updateUserInfoService, updateUserRoleService, validateForgotPasswordLinkService} from "./auth.service";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  sendToken,
} from "./auth.utils";

const authOriginService = new AuthOriginService();

export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  // Validate origin
  let origin = req.headers.origin;

  if (!origin) {
    try {
      origin = new URL(req.headers.referer || "").origin;
    } catch {
      throw new ApiError(httpStatus.FORBIDDEN, "Invalid origin");
    }
  }

  if (!origin || !authOriginService.validateOrigin(origin)) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid origin");
  }

  // Get OAuth data
  const { authUrl, codeVerifier, state } = getGoogleOAuthData();

  // Extract domain from origin for cookie settings
  const hostname = new URL(origin).hostname;
  const rootDomain = authOriginService.extractRootDomain(hostname);

  // Set cookies
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    sameSite: "lax" as const,
    domain:
      process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
  };

  res.cookie("google_oauth_state", state, cookieOptions);
  res.cookie("google_code_verifier", codeVerifier, cookieOptions);
  res.cookie("redirect_url", origin, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Google auth URL generated successfully",
    data: {
      redirectUrl: authUrl,
    },
  });
});

export const googleAuthCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, state } = req.query as {
      code: string;
      state: string;
    };
    if (!code || !state) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid query parameters");
    }

    const { google_oauth_state, google_code_verifier, redirect_url } =
      req.cookies;

    // Validate state
    if (!state || state !== google_oauth_state) {
      throw new ApiError(httpStatus.FORBIDDEN, "Invalid state");
    }

    await handleGoogleCallback(code, google_code_verifier, res);

    // Clear OAuth cookies
    res.clearCookie("google_oauth_state");
    res.clearCookie("google_code_verifier");
    res.clearCookie("redirect_url");

    res.redirect(redirect_url);
  }
);

export const googleAuthVerify = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user?._id;
  const accessToken = req.cookies.accessToken;

  const user = await googleAuthVerifyService(userId);

  sendResponse(res, {
    message: "google verify successfull",
    statusCode: httpStatus.OK,
    data: {
      user,
      accessToken,
    },
  });
});

// Register user
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body as TRegisterUser;
  const activationResponse = await registerUserService(userData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message:
      "Registration successful. Please check your email to activate your account.",
    data: activationResponse,
  });
});

// Activate user
export const activateUser = catchAsync(async (req: Request, res: Response) => {
  const { token, activation_code } = req.body;
  const user = await activationUserService(token, activation_code);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User activated successfully.",
    data: user,
  });
});

// Login user
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const loginResponse = await loginUserService(email, password);
  sendToken(loginResponse, res);
});

// Social Authentication
export const socialAuth = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;
  const socialAuthResponse = await socialAuthService(userData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Social authentication successful.",
    data: socialAuthResponse,
  });
});



// Update user info
export const updateUserInfo = catchAsync(
  async (req: Request, res: Response) => {
    const userId = res.locals.user._id;
    const updateData = req.body;
    const updatedUser = await updateUserInfoService(
      userId,
      updateData
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "User information updated successfully.",
      data: updatedUser,
    });
  }
);

// Forgot password
export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email, userType } = req.body;

    await forgotPasswordService(email, userType);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Password reset email sent successfully.",
    });
  }
);

// Validate forgot password link
export const forgotPasswordLinkValidation = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, token, userType } = req.params;
    await validateForgotPasswordLinkService(userId, token);

    // Determine the appropriate redirect URL based on userType
    const baseRedirectUrl =
      userType === "admin" ? config.domains.adminUrl : config.domains.clientUrl;

    res.redirect(`${baseRedirectUrl}/reset-password/${userId}/${token}`);
  }
);
// Logout user
export const logout = catchAsync(async (_req: Request, res: Response) => {
  await logoutService(res);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Logged out successfully.",
  });
});

// Get user info
export const getUserInfo = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const user = await getUserInfoService(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User information retrieved successfully.",
    data: user,
  });
});

// Update access token
export const updateAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Please login to access this resource"
      );
    }

    const result = await updateAccessTokenService(
      refreshToken,
      res
    );
    res.cookie("access_token", result.accessToken, accessTokenCookieOptions);
    res.cookie("refresh_token", result.refreshToken, refreshTokenCookieOptions);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Access token updated successfully.",
      data: result,
    });
  }
);

// Update password
export const updatePassword = catchAsync(
  async (req: Request, res: Response) => {
    const userId = res.locals.user._id;
    const { oldPassword, newPassword } = req.body;
    await updatePasswordService(userId, oldPassword, newPassword);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Password updated successfully.",
    });
  }
);

// Reset password
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { newPassword, token, userId } = req.body;
  await resetPasswordService(userId, token, newPassword);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password reset successful. Please login.",
  });
});

// Get all users
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllUsersService();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All users retrieved successfully.",
    data: result,
  });
});

// Update user role
export const updateUserRole = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, role } = req.body;
    const updatedUser = await updateUserRoleService(userId, role);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "User role updated successfully.",
      data: updatedUser,
    });
  }
);

// Delete user
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const targetUserId = req.params.userId;
  const currentUserId = res.locals.user._id;
  await deleteUserService(targetUserId, currentUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User deleted successfully.",
  });
});
