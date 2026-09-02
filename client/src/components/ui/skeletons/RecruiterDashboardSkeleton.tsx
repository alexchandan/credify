import { Skeleton, SkeletonCard, SkeletonText } from "./Skeleton";

export default function RecruiterDashboardSkeleton() {
  return (
    <main
      className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 dark:bg-slate-950"
      aria-busy="true"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <SkeletonText className="w-40" />
            <Skeleton className="h-10 w-96 max-w-full" />
            <SkeletonText className="w-72 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} className="h-36 p-5" />
          ))}
        </div>
        <SkeletonCard className="mt-6 h-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SkeletonCard className="h-100" />
          <SkeletonCard className="h-100" />
        </div>
      </div>
    </main>
  );
}
