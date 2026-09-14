import { Skeleton, SkeletonCard, SkeletonText } from "./Skeleton";

export function CandidateCardSkeleton() {
  return (
    <SkeletonCard className="flex flex-col justify-between rounded-2xl border border-slate-200/80 p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-13 w-13 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <SkeletonText className="w-24" />
            </div>
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <SkeletonText className="w-4/5" />
          <SkeletonText className="w-3/5" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export function CandidateListItemSkeleton() {
  return (
    <SkeletonCard className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 p-4.5 shadow-xs sm:p-5 lg:flex-row lg:items-center dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <Skeleton className="h-13 w-13 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <SkeletonText className="w-2/5" />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </SkeletonCard>
  );
}

export function CandidateListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: count }, (_, index) => (
        <CandidateListItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function CandidateGridSkeleton({
  count = 6,
  variant = "list",
}: {
  count?: number;
  variant?: "list" | "grid";
}) {
  if (variant === "list") {
    return <CandidateListSkeleton count={count} />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <CandidateCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function CandidateBoardSkeleton({
  variant = "list",
}: {
  variant?: "list" | "grid";
}) {
  return (
    <main className="flex-1 bg-slate-50/70 dark:bg-slate-950" aria-busy="true">
      <section className="border-b border-slate-200/80 bg-white px-4 py-10 sm:px-6 dark:border-white/10 dark:bg-slate-950/60">
        <div className="mx-auto max-w-6xl space-y-3">
          <SkeletonText className="w-28" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <SkeletonText className="w-96 max-w-full" />
          <SkeletonCard className="mt-7 h-28 rounded-2xl" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <CandidateGridSkeleton count={6} variant={variant} />
      </section>
    </main>
  );
}
