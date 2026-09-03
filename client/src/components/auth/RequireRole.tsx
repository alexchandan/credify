"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/context/AuthContext";
import CandidateDashboardSkeleton from "@/components/ui/skeletons/CandidateDashboardSkeleton";
import CandidateProfileSkeleton from "@/components/ui/skeletons/CandidateProfileSkeleton";
import CandidateApplicationsSkeleton from "@/components/ui/skeletons/CandidateApplicationsSkeleton";
import RecruiterDashboardSkeleton from "@/components/ui/skeletons/RecruiterDashboardSkeleton";
import RecruiterProfileSkeleton from "@/components/ui/skeletons/RecruiterProfileSkeleton";
import RecruiterJobsSkeleton from "@/components/ui/skeletons/RecruiterJobsSkeleton";
import JobApplicationsPipelineSkeleton from "@/components/ui/skeletons/JobApplicationsPipelineSkeleton";
import JobFormSkeleton from "@/components/ui/skeletons/JobFormSkeleton";

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
      router.replace("/");
      return;
    }

    router.replace("/unauthorized");
  }, [isAllowed, isLoading, pathname, router, user]);

  if (!isAllowed) {
    return <RolePageSkeleton pathname={pathname} />;
  }

  return children;
}

function RolePageSkeleton({ pathname }: { pathname: string }) {
  if (pathname === "/candidate/applications") {
    return <CandidateApplicationsSkeleton />;
  }

  if (pathname === "/candidate/dashboard") {
    return <CandidateDashboardSkeleton />;
  }

  if (pathname === "/candidate/profile") {
    return <CandidateProfileSkeleton />;
  }

  if (pathname === "/recruiter/dashboard") {
    return <RecruiterDashboardSkeleton />;
  }

  if (pathname === "/recruiter/profile") {
    return <RecruiterProfileSkeleton />;
  }

  if (pathname === "/recruiter/jobs") {
    return <RecruiterJobsSkeleton />;
  }

  if (pathname === "/recruiter/jobs/new" || pathname.endsWith("/edit")) {
    return <JobFormSkeleton />;
  }

  if (
    pathname.includes("/recruiter/jobs/") &&
    pathname.endsWith("/applications")
  ) {
    return <JobApplicationsPipelineSkeleton />;
  }

  return (
    <div
      className="flex flex-1 items-center justify-center px-6 py-16"
      role="status"
      aria-label="Loading page"
      aria-live="polite"
    >
      <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
