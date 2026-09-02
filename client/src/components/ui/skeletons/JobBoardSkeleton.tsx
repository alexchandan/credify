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
        <JobGridSkeleton />
      </section>
    </main>
  );
}

function JobGridSkeleton() {
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

export { JobCardSkeleton, JobGridSkeleton };
