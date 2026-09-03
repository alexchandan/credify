import { Skeleton, SkeletonText } from "./Skeleton";

export default function RecruiterProfileSkeleton() {
  return (
    <main
      className="flex-1 bg-slate-50/70 px-4 py-8 sm:px-6 sm:py-10 dark:bg-slate-950"
      aria-busy="true"
      aria-label="Loading recruiter profile"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <div className="border-b border-slate-200/80 pb-8 dark:border-slate-800">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="mt-3 h-10 w-96 max-w-full rounded-xl" />
          <SkeletonText className="mt-2 w-120 max-w-full" />
        </div>

        {/* 2-Column Layout */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left Sidebar Skeleton */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <Skeleton className="mt-4 h-6 w-36 rounded-md" />
              <Skeleton className="mt-2 h-4 w-44 rounded-md" />
              <Skeleton className="mt-1 h-3 w-32 rounded-md" />
              <Skeleton className="mt-4 h-6 w-28 rounded-full" />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
              <Skeleton className="mt-2 h-2 w-full rounded-full" />
            </div>
            <div className="mt-6 space-y-2 border-t border-slate-100 pt-5 dark:border-slate-800">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          </div>

          {/* Right Main Content Sections */}
          <div className="min-w-0 space-y-8">
            {/* Personal Info Skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-44 rounded-md" />
                  <Skeleton className="h-3 w-64 rounded-md" />
                </div>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>

            {/* Company Section Skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-52 rounded-md" />
                  <Skeleton className="h-3 w-72 rounded-md" />
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-36 rounded-xl" />
                    <Skeleton className="h-3 w-56 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-10 w-44 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Account Settings Skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-5 w-36 rounded-md" />
              <div className="mt-4 space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
