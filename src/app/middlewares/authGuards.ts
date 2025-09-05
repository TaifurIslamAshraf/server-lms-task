import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import ApiError from "../errorHandlers/ApiError";
import { verifyJwtToken } from "../helpers/jwtHelper";
import UserModel from "../modules/users/user.model";
import catchAsync from "./catchAsync";

export const isAuthenticated = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Please login to access this resource");
    }

    const accessToken = authHeader.split(" ")[1];

    // Verify the access token
    const decoded = verifyJwtToken(
      accessToken,
      config.security.accessTokenSecret
    ) as JwtPayload;

    if (!decoded) {
      throw new ApiError(401, "Please login to access this resource.");
    }

    const user = await UserModel.findById(decoded._id);

    if (!user) {
      throw new ApiError(404, "User not found. Please login again.");
    }

    res.locals.user = user;

    next();
  }
);

export const authorizeUser = (...roles: string[]) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(res.locals.user.role)) {
      throw new ApiError(
        403,
        `${res.locals.user.role} is not allowed to access this recourse`
      );
    }

    next();
  });
};
