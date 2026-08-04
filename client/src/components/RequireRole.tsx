"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/context/AuthContext";

interface RequireRoleProps {
  role: UserRole | UserRole[];
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for the mount-time session-restore attempt to finish — deciding
    // anything before that would redirect a genuinely logged-in user to
    // /login for a flash of a second while their session is still loading.
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [isLoading, user, router, role]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-slate-500">
        Checking session...
      </div>
    );
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!user || !allowedRoles.includes(user.role)) {
    // The effect above is already redirecting away — render nothing
    // meaningful in the meantime rather than flashing protected content.
    return null;
  }

  return <>{children}</>;
}
