import { Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isSocialAuth: boolean;
  avatar: string;
  role: "admin" | "user";
  address: string;
  phone: string;
  
  comparePassword: (entredPassword: string) => Promise<boolean>;
  accessToken: () => string;
  refreshToken: () => string;
}

export interface IUserInfo {
  fullName: string;
  email: string;
  password: string;
  isSocialAuth: boolean;
  avatar: string;
  role: "admin" | "user";
  address: string;
  phone: string;

}

export interface IActivationInfo {
  fullName: string;
  email: string;
  password: string;
  isSocialAuth: boolean;
  avatar?: string;
  address: string;
  phone: string;
}
