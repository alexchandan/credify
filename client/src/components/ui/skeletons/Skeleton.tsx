import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
};

type SkeletonCardProps = SkeletonProps & {
  children?: ReactNode;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-3 ${className}`} />;
}

export function SkeletonCard({ className = "", children }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}
