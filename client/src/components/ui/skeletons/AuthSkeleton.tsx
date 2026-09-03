import { Skeleton } from "./Skeleton";

export function AuthSkeleton({ isRegister = false }: { isRegister?: boolean }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading authentication form"
      className="mx-auto flex w-full max-w-md flex-1 items-center px-5 py-10 sm:px-6 sm:py-14"
    >
      <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
        {/* Logo box skeleton */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100/80 bg-cyan-50/70 dark:border-cyan-900/50 dark:bg-cyan-950/40">
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>

        {/* Title & Subtitle skeleton */}
        <Skeleton className="mx-auto h-7 w-48 rounded-lg" />
        <Skeleton className="mx-auto mt-2.5 h-4 w-64 rounded-md" />

        {isRegister && (
          /* Role toggle tabs skeleton */
          <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/70 p-1.5 dark:border-slate-800 dark:bg-slate-900/80">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
        )}

        {/* Input fields skeleton */}
        <div className="mt-6 flex flex-col gap-5">
          {isRegister && (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          )}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          {isRegister && (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          )}

          {/* Submit button skeleton */}
          <Skeleton className="mt-2 h-11 w-full rounded-lg" />
        </div>

        {/* Footer link skeleton */}
        <Skeleton className="mx-auto mt-6 h-4 w-44 rounded-md" />
      </div>
    </section>
  );
}
