import { Skeleton } from "./Skeleton";

export function RecruiterJobsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading jobs"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header Banner Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="mt-3 h-8 w-64 rounded-lg sm:w-80" />
          <Skeleton className="mt-2 h-4 w-72 rounded-md sm:w-96" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg sm:w-64" />
      </div>

      {/* Job Cards Grid Skeleton */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              {/* Top Bar: Status + Action buttons */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>

              {/* Title */}
              <Skeleton className="mt-4 h-5 w-4/5 rounded-md" />

              {/* Meta details */}
              <div className="mt-3 flex gap-3">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>

              {/* Salary */}
              <Skeleton className="mt-3 h-4 w-32 rounded-md" />

              {/* Skills tags */}
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecruiterJobsSkeleton;
