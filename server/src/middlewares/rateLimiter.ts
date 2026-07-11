import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { sendError } from "../utils/apiResponse.js";

/**
 * Applied globally in app.js — generous for now. In Phase 2 we'll add a
 * much stricter limiter specifically on /auth/login and /auth/register
 * to slow down brute-force attempts, and later a separate one on the
 * AI endpoints since those calls cost real money.
 */

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response): void => {
    sendError(res, {
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
    });
  },
});

/**
 * Stricter limiter for sensitive auth endpoints (login, register,
 * forgot-password) — these are exactly the routes brute-force and
 * credential-stuffing attempts target, and forgot-password specifically
 * can be abused to spam a victim's inbox if left at the global limit.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response): void => {
    sendError(res, {
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many attempts. Please try again later.",
    });
  },
});
