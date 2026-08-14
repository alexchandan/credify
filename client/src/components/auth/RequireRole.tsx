"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/context/AuthContext";

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAllowed = Boolean(user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isLoading || isAllowed) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    router.replace("/unauthorized");
  }, [isAllowed, isLoading, pathname, router, user]);

  if (isLoading || !isAllowed) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-slate-500"
        role="status"
        aria-live="polite"
      >
        Checking access...
      </div>
    );
  }

  return children;
}
