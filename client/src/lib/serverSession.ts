import { cookies } from "next/headers";
import type { AuthUser } from "@/context/AuthContext";
import type { ApiSuccessBody } from "@/lib/apiClient";

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? "http://localhost:5000/api/v1";

export interface ServerSession {
  user: AuthUser;
  accessToken: string;
}

/**
 * Resolves the httpOnly refresh cookie into a user, server-side, before the
 * app's first paint — mirrors what AuthContext's old client-only mount
 * effect did, so the Nav no longer has to render a loading skeleton and
 * then flash in the real state after hydration.
 *
 * Note: this rotates the refresh cookie (the backend issues a new one on
 * every /auth/refresh call), but Server Components can't write Set-Cookie,
 * so that rotated value never reaches the browser. That's harmless today
 * because the backend has no refresh-token reuse detection (see
 * server/src/modules/auth/auth.service.ts refreshTokens()) — revisit this
 * (e.g. move to a Route Handler) if that ever changes.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const refreshRes = await fetch(`${API_INTERNAL_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });
    if (!refreshRes.ok) return null;
    const refreshJson = (await refreshRes.json()) as ApiSuccessBody<{
      accessToken: string;
    }>;
    const accessToken = refreshJson.data.accessToken;

    const meRes = await fetch(`${API_INTERNAL_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!meRes.ok) return null;
    const meJson = (await meRes.json()) as ApiSuccessBody<AuthUser>;

    return { user: meJson.data, accessToken };
  } catch {
    return null;
  }
}
