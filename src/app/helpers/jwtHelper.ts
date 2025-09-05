import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../errorHandlers/ApiError";

export const createJwtToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): string => {
  const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

  return token;
};

export const verifyJwtToken = <T>(token: string, secret: string): T => {
  try {
    const payload = jwt.verify(token, secret) as JwtPayload | string;
    return payload as T;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid signature");
  }
};
