import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { sendError } from "../utils/apiResponse.js";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
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
  max: 100,
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
