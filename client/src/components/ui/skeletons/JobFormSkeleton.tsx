import { Skeleton } from "./Skeleton";

export function JobFormSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading job form"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Back button */}
      <div className="mb-6">
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>

      {/* Main Form Container Skeleton */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <Skeleton className="h-5 w-44 rounded-full" />
        <Skeleton className="mt-3 h-8 w-60 rounded-lg sm:w-72" />
        <Skeleton className="mt-2 h-4 w-80 rounded-md" />

        <div className="mt-8 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Work Setup */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Section 3: Skills */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Skeleton className="h-5 w-52 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>

          {/* Section 4: Compensation */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Skeleton className="h-5 w-48 rounded-md" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Section 5: Description */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Skeleton className="h-5 w-56 rounded-md" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobFormSkeleton;
