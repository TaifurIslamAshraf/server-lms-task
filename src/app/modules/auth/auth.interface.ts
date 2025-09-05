import { IUserInfo } from "../users/user.interface";

export interface GoogleAuthData {
  authUrl: string;
  codeVerifier: string;
  state: string;
  scopes: string[];
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

export interface ITokenOptions {
  payload: object | string;
  jwtSecret: string;
  expireIn?: string;
}

export interface IActivation {
  token: string;
  activationCode: string;
}

export type TRegisterUser = Omit<IUserInfo, "role" | "reviewsInfo" | "avater">;
