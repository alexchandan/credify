export function NotificationSkeleton() {
  return (
    <div
      className="max-h-80 min-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800"
      role="status"
      aria-label="Loading notifications"
      aria-busy="true"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3">
          <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
