// user.routes.ts
import express from "express";
import {
  authorizeUser,
  isAuthenticated,
} from "../../middlewares/authGuards";
import validateRequest from "../../middlewares/validateRequest";
import {
  activateUser,
  deleteUser,
  forgotPassword,
  forgotPasswordLinkValidation,
  getAllUsers,
  getUserInfo,
  registerUser,
  resetPassword,
  updatePassword,
  updateUserInfo,
  updateUserRole,
} from "../auth/auth.controller";
import {
  activateUserSchema,
  forgotPasswordSchema,
  registerUserSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateUserInfoSchema,
  updateUserRoleSchema,
} from "../auth/auth.validation";

const userRouter = express.Router();

// User registration and activation
userRouter.post("/register", validateRequest(registerUserSchema), registerUser);
userRouter.post("/activate", validateRequest(activateUserSchema), activateUser);

// User profile management
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.put(
  "/update-info",
  isAuthenticated,
  validateRequest(updateUserInfoSchema),
  updateUserInfo
);


// Password management
userRouter.put(
  "/update-password",
  isAuthenticated,
  validateRequest(updatePasswordSchema),
  updatePassword
);
userRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);
userRouter.get(
  "/forgot-password-link-validation/:userId/:token/:userType",
  forgotPasswordLinkValidation
);
userRouter.put(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);

// Admin routes
userRouter.get(
  "/all-users",
  isAuthenticated,
  authorizeUser("admin"),
  getAllUsers
);
userRouter.put(
  "/update-role",
  validateRequest(updateUserRoleSchema),
  isAuthenticated,
  authorizeUser("admin"),
  updateUserRole
);
userRouter.delete(
  "/delete-user/:userId",
  isAuthenticated,
  authorizeUser("admin"),
  deleteUser
);

export default userRouter;
