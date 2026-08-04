import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authRateLimiter } from "../../middlewares/rateLimiter.js";
import * as authController from "./auth.controller.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "./auth.validation.js";

const router: Router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  catchAsync(authController.register),
);
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  catchAsync(authController.login),
);

// No body to validate — the refresh token comes from the httpOnly cookie, not req.body.
router.post("/refresh", catchAsync(authController.refresh));

router.post("/logout", catchAsync(authController.logout));
router.post(
  "/logout-everywhere",
  authenticate,
  catchAsync(authController.logoutEverywhere),
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  catchAsync(authController.verifyEmail),
);

router.post(
  "/resend-verification",
  authRateLimiter, // same abuse-prevention reasoning as forgot-password — can spam an inbox otherwise
  validate(resendVerificationSchema),
  catchAsync(authController.resendVerification),
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  catchAsync(authController.forgotPassword),
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  catchAsync(authController.resetPassword),
);

router.get("/me", authenticate, catchAsync(authController.getMe));

router.post(
  "/change-password",
  authenticate,
  authRateLimiter,
  validate(changePasswordSchema),
  catchAsync(authController.changePassword),
);

router.delete(
  "/delete-account",
  authenticate,
  authRateLimiter,
  validate(deleteAccountSchema),
  catchAsync(authController.deleteAccount),
);

export { router as authRouter };
