import { Skeleton, SkeletonCard, SkeletonText } from "./Skeleton";

export default function JobDetailSkeleton() {
  return (
    <main
      className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 dark:bg-slate-900"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl">
        <SkeletonText className="w-24" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <SkeletonCard className="min-h-120 p-6 sm:p-8">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <Skeleton className="mt-6 h-9 w-3/4 max-w-full" />
            <SkeletonText className="mt-3 w-2/5" />
            <div className="mt-8 flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-7 w-24 rounded-full" />
              ))}
            </div>
            <Skeleton className="mt-10 h-5 w-40" />
            <div className="mt-4 space-y-3">
              <SkeletonText className="w-full" />
              <SkeletonText className="w-11/12" />
              <SkeletonText className="w-4/5" />
              <SkeletonText className="w-3/5" />
            </div>
          </SkeletonCard>
          <div className="space-y-6">
            <SkeletonCard className="h-64 p-6" />
            <SkeletonCard className="h-52 p-6" />
          </div>
        </div>
      </div>
    </main>
  );
}
