export function NotificationSkeleton() {
  return (
    <div
      className="max-h-80 divide-y divide-slate-100 overflow-hidden dark:divide-slate-800"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse px-4 py-3">
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="pt-1">
              <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
