import { z } from "zod";
import { UserRole } from "../../models/user.model.js";

export const registerSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
  password: z
    .string()
    .min(6, {
      error: "Password must be at least 6 characters",
    })
    .max(15, {
      error: "Password must be at most 15 characters",
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

export const resendVerificationSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { error: "Reset token is required" }),
  newPassword: z
    .string()
    .min(6, { error: "Password must be at least 6 characters" })
    .max(15, { error: "Password must be at most 15 characters" }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
