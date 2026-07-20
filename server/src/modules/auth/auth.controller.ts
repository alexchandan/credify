import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../../utils/tokenUtils.js";
import * as authService from "./auth.service.js";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ResendVerificationInput,
} from "./auth.validation.js";

export async function register(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterInput;
  const result = await authService.register(input);
  sendSuccess(res, {
    data: result,
    message:
      "Registration successful. Please check your email to verify your account.",
    statusCode: 201,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;
  const { accessToken, refreshToken, user } = await authService.login(input);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  sendSuccess(res, {
    data: { accessToken, user },
    message: "Login successful",
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
    string | undefined;

  if (!rawRefreshToken) {
    throw new AppError(401, "AUTH_UNAUTHORIZED", "No refresh token provided");
  }

  const { accessToken, refreshToken } =
    await authService.refreshTokens(rawRefreshToken);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  sendSuccess(res, { data: { accessToken }, message: "Token refreshed" });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless logout: the refresh token isn't individually revoked (see the
  // known limitation noted in auth.service.ts's refreshTokens()) — we simply
  // stop sending it. Clearing the cookie must use the SAME options it was
  // set with (path/sameSite/secure), or the browser won't remove it.
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  sendSuccess(res, { data: null, message: "Logged out" });
}

export async function logoutEverywhere(
  req: Request,
  res: Response,
): Promise<void> {
  // Requires `authenticate` to have run first — see auth.routes.ts.
  await authService.logoutEverywhere(req.user!.userId);
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  sendSuccess(res, { data: null, message: "Logged out of all sessions" });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body as VerifyEmailInput;
  await authService.verifyEmail(token);
  sendSuccess(res, { data: null, message: "Email verified successfully" });
}

export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body as ForgotPasswordInput;
  await authService.forgotPassword(email);
  // Same response regardless of whether the email existed — see the
  // enumeration-safety note on authService.forgotPassword().
  sendSuccess(res, {
    data: null,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { token, newPassword } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, newPassword);
  sendSuccess(res, {
    data: null,
    message: "Password reset successful. Please log in again.",
  });
}

export async function resendVerification(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body as ResendVerificationInput;
  await authService.resendVerificationEmail(email);
  // Same enumeration-safe generic response regardless of what actually
  // happened server-side — see authService.resendVerificationEmail().
  sendSuccess(res, {
    data: null,
    message:
      "If this account is pending verification, a new link has been sent.",
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const me = await authService.getMe(req.user!.userId);
  sendSuccess(res, { data: me });
}
