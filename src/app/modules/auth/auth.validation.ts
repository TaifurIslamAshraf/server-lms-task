import { z } from "zod";

// Auth related schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const socialAuthSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    name: z.string(),
    avatar: z.string().optional(),
    provider: z.enum(["google", "facebook", "github"]),
  }),
});

export const googleAuthCallbackSchema = z.object({
  query: z.object({
    code: z.string(),
    state: z.string(),
  }),
  cookies: z.object({
    google_oauth_state: z.string(),
    google_code_verifier: z.string(),
    redirect_url: z.string(),
  }),
});

// User related schemas
export const registerUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const activateUserSchema = z.object({
  body: z.object({
    token: z.string(),
    activation_code: z
      .string()
      .length(4, "Activation code must be 6 characters"),
  }),
});

export const updateUserInfoSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    userId: z.string(),
    token: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    userId: z.string(),
    role: z.enum(["user", "admin"]),
  }),
});
