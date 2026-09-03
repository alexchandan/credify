import { Skeleton } from "./Skeleton";

export function JobApplicationsPipelineSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading candidate applications"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-32 rounded-md" />
      </div>

      {/* Header Banner Skeleton */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-5 w-44 rounded-full" />
            <Skeleton className="mt-3 h-8 w-64 rounded-lg sm:w-80" />
            <Skeleton className="mt-2 h-4 w-52 rounded-md" />
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex flex-col items-center">
              <Skeleton className="h-7 w-10 rounded-md" />
              <Skeleton className="mt-1 h-3 w-16 rounded-xs" />
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col items-center">
              <Skeleton className="h-7 w-10 rounded-md" />
              <Skeleton className="mt-1 h-3 w-16 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Pipeline Stage Tabs Skeleton */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>

        {/* Candidate Cards Skeleton */}
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950"
            >
              {/* Candidate Info */}
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-60 rounded-md" />
                  <div className="mt-2 flex gap-3">
                    <Skeleton className="h-3.5 w-36 rounded-xs" />
                    <Skeleton className="h-3.5 w-24 rounded-xs" />
                    <Skeleton className="h-3.5 w-20 rounded-xs" />
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Skeleton className="h-4 w-14 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2.5 sm:mt-0">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JobApplicationsPipelineSkeleton;
