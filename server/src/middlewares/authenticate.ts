import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/tokenUtils.js";

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

/**
 * Verifies the access token and attaches { userId, role } to req.user.
 * Does NOT hit the database — that's the point of a JWT. Any check that
 * requires fresh DB state (e.g. "is this user still active") belongs in
 * the specific route/service that needs it, not here.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req);

  if (!token) {
    return next(
      new AppError(401, "AUTH_UNAUTHORIZED", "No access token provided"),
    );
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(
        new AppError(401, "AUTH_TOKEN_EXPIRED", "Access token has expired"),
      );
    }
    return next(
      new AppError(401, "AUTH_TOKEN_INVALID", "Invalid access token"),
    );
  }
}
