"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface RequireGuestProps {
  children: ReactNode;
}

/**
 * The inverse of RequireRole — for pages that only make sense while
 * LOGGED OUT (login, register, verify-email, check-email,
 * forgot-password). An already-authenticated user landing on /login has
 * nothing to do there; bounce them home instead of showing a login form
 * to someone who's already logged in.
 *
 * Deliberately NOT applied to reset-password — that flow can be reached
 * from a real emailed link at any time, including while a different
 * session is still logged in elsewhere, and consuming it shouldn't
 * depend on the current browser's auth state.
 */
export function RequireGuest({ children }: RequireGuestProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    // Same reasoning as RequireRole — wait for the mount-time session
    // restore to actually resolve before deciding anything, or a
    // genuinely logged-out user gets bounced for a flash of a second.
    if (isLoading) return;

    if (user) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        showToast("You're already logged in.", "info");
      }
      router.replace("/");
    }
  }, [isLoading, user, router, showToast]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-slate-500">
        Checking session...
      </div>
    );
  }

  if (user) {
    // The effect above is already redirecting away.
    return null;
  }

  return <>{children}</>;
}
