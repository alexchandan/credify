export const GUEST_ONLY_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/check-email",
  "/reset-password",
  "/verify-email",
] as const;

export type ProtectedRole = "candidate" | "recruiter";

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.some((path) => pathname === path);
}

export function protectedRoleForPath(pathname: string): ProtectedRole | null {
  if (pathname === "/candidate" || pathname.startsWith("/candidate/")) {
    return "candidate";
  }

  if (pathname === "/recruiter" || pathname.startsWith("/recruiter/")) {
    return "recruiter";
  }

  return null;
}

export function workspacePathForRole(role: string): string {
  if (role === "candidate") return "/candidate/dashboard";
  if (role === "recruiter") return "/recruiter/dashboard";
  return "/";
}

export function isSafeInternalPath(path: string | null): path is string {
  return Boolean(path?.startsWith("/") && !path.startsWith("//"));
}
