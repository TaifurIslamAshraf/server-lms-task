import { Google } from "arctic";
import { CookieOptions, Response } from "express";
import config from "../../config/config";
import { createJwtToken } from "../../helpers/jwtHelper";
import { IActivationInfo } from "../users/user.interface";
import { IActivation } from "./auth.interface";

// Initialize Google OAuth with your credentials
export const google = new Google(
  config.auth.google.clientID!,
  config.auth.google.clientSecret!,
  `${config.domains.serverUrl}/api/v1/auth/google/callback`
);

const accessTokenExpire = parseInt(
  config.cookieExpire.accessTokenCookieExpire || "1",
  10
);
const refreshTokenExpire = parseInt(
  config.cookieExpire.refreshTokenCookieExpire || "1",
  10
);

//options for cookis
export const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(Date.now() + accessTokenExpire),
  httpOnly: true,
  secure: config.app.env === "production",
  sameSite: "none",
};

export const refreshTokenCookieOptions: CookieOptions = {
  expires: new Date(Date.now() + refreshTokenExpire),
  httpOnly: true,
  secure: config.app.env === "production",
  sameSite: "none",
};

export const sendToken = (user: any, res: Response) => {
  const accessToken = user.accessToken();
  const refreshToken = user.refreshToken();

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  res.locals.user = user;

  const userInfo = {
    fullName: user?.fullName,
    email: user?.email,
    phone: user?.phone,
    isSocialAuth: user?.isSocialAuth,
    role: user?.role,
    address: user?.address,
    _id: user?._id,
  };

  res.status(200).json({
    success: true,
    message: "User login successfully",
    user: userInfo,
    accessToken,
    refreshToken,
  });
};

export const createActivationToken = (user: IActivationInfo): IActivation => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = createJwtToken(
    { user, activationCode },
    config.security.mailVarificationTokenSecret,
    "5m"
  );

  return { activationCode, token };
};
