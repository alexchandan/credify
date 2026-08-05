import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../models/user.model.js";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

const ACCESS_TOKEN_TTL: NonNullable<SignOptions["expiresIn"]> = "15m";
const REFRESH_TOKEN_TTL: NonNullable<SignOptions["expiresIn"]> = "30d";

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
}

export const REFRESH_COOKIE_NAME = "refreshToken";

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict" as const,
    // "/" (not scoped to /api/v1/auth) so the browser also sends it on
    // normal page navigations — the Next.js app reads it server-side via
    // next/headers to resolve the session before first paint.
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}
