import { z } from "zod";
import { UserRole } from "../../models/user.model.js";

export const registerSchema = z
  .object({
    email: z.email({
      error: "Invalid email address",
    }),
    password: z
      .string()
      .min(8, {
        error: "Password must be at least 8 characters",
      })
      .max(15, {
        error: "Password must be at most 15 characters",
      }),
    confirmPassword: z.string().min(1, {
      error: "Confirm password is required",
    }),
    fullName: z
      .string()
      .trim()
      .min(1, { error: "Full name is required" })
      .max(150, {
        error: "Full Name cannnot exceed 150 characters",
      }),
    role: z.enum([UserRole.CANDIDATE, UserRole.RECRUITER] as const, {
      error: "Role must be either candidate or recruiter",
    }),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
  password: z.string().min(1, {
    error: "Password is required",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { error: "Verification token is required" }),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resendVerificationSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { error: "Reset token is required" }),
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .max(15, { error: "Password must be at most 15 characters" }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { error: "Current password is required" }),
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .max(15, { error: "Password must be at most 15 characters" }),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, { error: "Password is required to confirm account deletion" }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
