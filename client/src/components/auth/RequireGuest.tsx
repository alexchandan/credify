"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isGuestOnlyPath, workspacePathForRole } from "@/lib/authRoutes";

interface RequireGuestProps {
  children: ReactNode;
}

const useBeforePaintEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function RequireGuest({ children }: RequireGuestProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const redirectedPath = useRef<string | null>(null);
  const isUnauthorizedPage = pathname === "/unauthorized";

  useBeforePaintEffect(() => {
    if (isUnauthorizedPage || !user || redirectedPath.current === pathname) {
      return;
    }

    redirectedPath.current = pathname;

    try {
      const previousPage = new URL(document.referrer);
      if (
        previousPage.origin === window.location.origin &&
        !isGuestOnlyPath(previousPage.pathname)
      ) {
        router.back();
        return;
      }
    } catch {
      // Use the role workspace when there is no safe same-origin history.
    }

    router.replace(workspacePathForRole(user.role));
  }, [isUnauthorizedPage, pathname, router, user]);

  if (!isUnauthorizedPage && user) return null;

  return children;
}
