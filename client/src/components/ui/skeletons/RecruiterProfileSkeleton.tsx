import { Skeleton, SkeletonCard, SkeletonText } from "./Skeleton";

export default function RecruiterProfileSkeleton() {
  return (
    <main
      className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 dark:bg-slate-900"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-3">
          <SkeletonText className="w-32" />
          <Skeleton className="h-10 w-80 max-w-full" />
          <SkeletonText className="w-96 max-w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <SkeletonCard className="h-64 p-5" />
          <div className="space-y-6">
            <SkeletonCard className="h-64 p-6" />
            <SkeletonCard className="h-136 p-6" />
            <SkeletonCard className="h-40 p-6" />
          </div>
        </div>
      </div>
    </main>
  );
}
