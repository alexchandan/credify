import { Skeleton, SkeletonText } from "./Skeleton";

export default function RecruiterDashboardSkeleton() {
  return (
    <main
      className="flex-1 bg-slate-50/70 px-4 py-8 sm:px-6 sm:py-10 dark:bg-slate-950"
      aria-busy="true"
      aria-label="Loading recruiter dashboard"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end dark:border-slate-800">
          <div className="space-y-3">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-10 w-80 max-w-full rounded-xl" />
            <SkeletonText className="w-96 max-w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="mt-4 h-9 w-16 rounded-lg" />
              <Skeleton className="mt-2 h-4 w-28 rounded-md" />
              <Skeleton className="mt-1.5 h-3 w-36 rounded-md" />
            </div>
          ))}
        </div>

        {/* Pipeline Funnel Card */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-72 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-3.5 w-full rounded-full" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-4 dark:border-slate-800/80 dark:bg-slate-900/50"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="mt-3 h-7 w-12 rounded-md" />
                <Skeleton className="mt-1.5 h-3 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Split 2-Column Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Applications list skeleton */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="mt-1 h-3 w-56 rounded-md" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right column skeleton: Company + Jobs */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3.5">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="mt-1 h-3 w-48 rounded-md" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="space-y-2 px-6 py-4">
                    <Skeleton className="h-4 w-44 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
