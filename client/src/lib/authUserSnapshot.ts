import type { AuthUser } from "@/context/AuthContext";

export const AUTH_USER_SNAPSHOT_COOKIE = "credify-auth-user";

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<AuthUser>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    (candidate.role === "candidate" ||
      candidate.role === "recruiter" ||
      candidate.role === "admin")
  );
}

export function decodeAuthUserSnapshot(value?: string): AuthUser | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    return isAuthUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeAuthUserSnapshot(user: AuthUser | null): void {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (!user) {
    document.cookie = `${AUTH_USER_SNAPSHOT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${AUTH_USER_SNAPSHOT_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
}
