import { Skeleton, SkeletonCard, SkeletonText } from "./Skeleton";

export default function CandidateDashboardSkeleton() {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-900" aria-busy="true">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-3 border-b border-slate-200 pb-7 dark:border-slate-800">
          <SkeletonText className="w-32" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <SkeletonText className="w-96 max-w-full" />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} className="h-28" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
          <SkeletonCard className="h-104" />
          <SkeletonCard className="h-72" />
        </div>
      </div>
    </main>
  );
}
