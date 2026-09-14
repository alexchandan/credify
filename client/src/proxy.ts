import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_USER_SNAPSHOT_COOKIE,
  decodeAuthUserSnapshot,
} from "./lib/authUserSnapshot";
import {
  isGuestOnlyPath,
  protectedRoleForPath,
  workspacePathForRole,
} from "./lib/authRoutes";

function previousOrWorkspace(request: NextRequest, role: string): URL {
  const referrer = request.headers.get("referer");

  if (referrer) {
    try {
      const previousPage = new URL(referrer);
      if (
        previousPage.origin === request.nextUrl.origin &&
        !isGuestOnlyPath(previousPage.pathname)
      ) {
        return previousPage;
      }
    } catch {
      // Use the role workspace when the referrer is not a valid URL.
    }
  }

  return new URL(workspacePathForRole(role), request.url);
}

function loginWithCallback(request: NextRequest): URL {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return loginUrl;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiredRole = protectedRoleForPath(pathname);
  const isGuestRoute = isGuestOnlyPath(pathname);

  // The matcher is intentionally duplicated as a defensive boundary so a
  // future matcher edit can never redirect public pages such as `/`.
  if (!requiredRole && !isGuestRoute) return NextResponse.next();

  const user = decodeAuthUserSnapshot(
    request.cookies.get(AUTH_USER_SNAPSHOT_COOKIE)?.value,
  );

  if (requiredRole) {
    if (!user) {
      return NextResponse.redirect(loginWithCallback(request));
    }

    if (user.role !== requiredRole) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  if (!user) return NextResponse.next();

  return NextResponse.redirect(previousOrWorkspace(request, user.role));
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/check-email",
    "/reset-password",
    "/verify-email",
    "/candidate/:path*",
    "/recruiter/:path*",
  ],
};

export const proxyConfig = config;
