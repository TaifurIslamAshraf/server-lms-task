// auth.routes.ts
import express from "express";
import { isAuthenticated } from "../../middlewares/authGuards";
import validateRequest from "../../middlewares/validateRequest";
import {
  googleAuth,
  googleAuthCallback,
  googleAuthVerify,
  loginUser,
  logout,
  socialAuth,
  updateAccessToken,
} from "./auth.controller";
import {
  googleAuthCallbackSchema,
  loginSchema,
  socialAuthSchema,
} from "./auth.validation";

const authRouter = express.Router();

// Auth routes

authRouter.get("/google", googleAuth);
authRouter.get(
  "/google/callback",
  validateRequest(googleAuthCallbackSchema),
  googleAuthCallback
);

authRouter.get("/google/verify", isAuthenticated, googleAuthVerify);

authRouter.post("/login", validateRequest(loginSchema), loginUser);
authRouter.post("/social-auth", validateRequest(socialAuthSchema), socialAuth);
authRouter.post("/logout", isAuthenticated, logout);
authRouter.get("/refresh", updateAccessToken);

export default authRouter;
