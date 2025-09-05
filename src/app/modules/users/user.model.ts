import bcrypt from "bcrypt";
import { Model, Schema, model } from "mongoose";

import httpStatus from "http-status";
import config from "../../config/config";
import ApiError from "../../errorHandlers/ApiError";
import { createJwtToken } from "../../helpers/jwtHelper";
import { IUser } from "./user.interface";

const userSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      validate: {
        validator: (v: string) =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: "Enter a valid email",
      },
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },
    isSocialAuth: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
    },
    address: {
      type: String,
      // required: [true, "Address is Required"],
    },

    phone: {
      type: String,
      // required: [true, "Phone number is required"],
    },
   
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

//hash pssword
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || this.isSocialAuth || !this.password) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

//access token
userSchema.methods.accessToken = function () {
  return createJwtToken(
    { _id: this._id },
    config.security.accessTokenSecret as string,
    config.jwtExpires.accessTokenExpire!
  );
};

userSchema.methods.accessToken = function () {
  return createJwtToken(
    { _id: this._id },
    config.security.accessTokenSecret as string,
    config.jwtExpires.accessTokenExpire!
  );
};

//refresh token
userSchema.methods.refreshToken = function () {
  return createJwtToken(
    { _id: this._id },
    config.security.refreshTokenSecret as string,
    config.jwtExpires.refreshTokenExpire!
  );
};

// Add indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ fullName: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, role: 1 });

//compare password
userSchema.methods.comparePassword = async function (
  entredPassword: string
): Promise<boolean> {
  if (!this.password) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid Email or Password");
  }
  const isMatch = await bcrypt.compare(entredPassword, this.password);
  return isMatch;
};

const UserModel: Model<IUser> = model("User", userSchema);
export default UserModel;
