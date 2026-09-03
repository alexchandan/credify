import { Skeleton } from "./Skeleton";

export function CandidateApplicationsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading job applications"
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="mt-3 h-8 w-60 rounded-lg sm:w-72" />
          <Skeleton className="mt-2 h-4 w-72 rounded-md sm:w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Filter Tabs & Search Skeleton */}
      <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-18 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-22 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg sm:w-64" />
      </div>

      {/* Application Cards Skeleton */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Job & Company Details */}
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-4 w-32 rounded-md" />
                <div className="mt-2.5 flex gap-3">
                  <Skeleton className="h-3.5 w-24 rounded-xs" />
                  <Skeleton className="h-3.5 w-24 rounded-xs" />
                  <Skeleton className="h-3.5 w-32 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2.5 sm:mt-0">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CandidateApplicationsSkeleton;
