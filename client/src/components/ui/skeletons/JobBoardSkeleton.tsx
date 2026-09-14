import { Skeleton, SkeletonCard, SkeletonText } from "./Skeleton";

function JobCardSkeleton() {
  return (
    <SkeletonCard className="min-h-64 p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-5 w-4/5" />
      <SkeletonText className="mt-3 w-2/5" />
      <div className="mt-6 space-y-2">
        <SkeletonText className="w-3/5" />
        <SkeletonText className="w-4/5" />
      </div>
      <Skeleton className="mt-6 h-9 w-full" />
    </SkeletonCard>
  );
}

function JobListItemSkeleton() {
  return (
    <SkeletonCard className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 p-4.5 shadow-xs sm:flex-row sm:items-center sm:p-5">
      <div className="flex flex-1 items-start gap-3.5 sm:items-center">
        <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end">
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </SkeletonCard>
  );
}

function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 space-y-3.5">
      {Array.from({ length: count }, (_, index) => (
        <JobListItemSkeleton key={index} />
      ))}
    </div>
  );
}

export default function JobBoardSkeleton() {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950" aria-busy="true">
      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 dark:border-white/10 dark:bg-slate-950/60">
        <div className="mx-auto max-w-6xl space-y-3">
          <SkeletonText className="w-24" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <SkeletonText className="w-96 max-w-full" />
          <SkeletonCard className="mt-7 h-24" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="h-7 w-44" />
        <SkeletonText className="mt-3 w-28" />
        <JobGridSkeleton variant="list" />
      </section>
    </main>
  );
}

function JobGridSkeleton({ variant = "list" }: { variant?: "list" | "grid" }) {
  if (variant === "list") {
    return <JobListSkeleton />;
  }

  return (
    <div>
      <SkeletonText className="mt-2 w-24" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export {
  JobCardSkeleton,
  JobGridSkeleton,
  JobListItemSkeleton,
  JobListSkeleton,
};
