export default function CandidateProfileSkeleton() {
  const skeleton = "animate-pulse bg-slate-200 dark:bg-slate-700/50";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#151e31] dark:text-white">
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 lg:px-6">
        {/* Page heading */}
        <div className="mb-6 space-y-3">
          <div className={`h-3 w-28 rounded ${skeleton}`} />
          <div className={`h-7 w-80 max-w-full rounded ${skeleton}`} />
          <div className={`h-3 w-96 max-w-full rounded ${skeleton}`} />
        </div>

        <div className="border-t border-slate-200 pt-6 dark:border-slate-700/70">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            {/* Left sidebar */}
            <aside className="space-y-4">
              {/* Profile card */}
              <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex flex-col items-center">
                  <div className={`h-20 w-20 rounded-full ${skeleton}`} />

                  <div className={`mt-4 h-4 w-28 rounded ${skeleton}`} />
                  <div className={`mt-2 h-3 w-20 rounded ${skeleton}`} />

                  <div className={`mt-4 h-8 w-20 rounded-md ${skeleton}`} />

                  <div className={`mt-4 h-2 w-40 rounded ${skeleton}`} />
                </div>
              </div>

              {/* Profile strength */}
              <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center justify-between">
                  <div className={`h-3 w-24 rounded ${skeleton}`} />
                  <div className={`h-3 w-8 rounded ${skeleton}`} />
                </div>

                <div className={`mt-3 h-1.5 w-full rounded-full ${skeleton}`} />

                <div className={`mt-4 h-2.5 w-20 rounded ${skeleton}`} />
                <div className={`mt-2 h-2.5 w-full rounded ${skeleton}`} />
                <div className={`mt-1 h-2.5 w-3/4 rounded ${skeleton}`} />
              </div>

              {/* Navigation */}
              <nav className="hidden space-y-3 px-3 pt-1 lg:block">
                <div className={`h-2.5 w-24 rounded ${skeleton}`} />
                <div className={`h-2.5 w-12 rounded ${skeleton}`} />
                <div className={`h-2.5 w-16 rounded ${skeleton}`} />
                <div className={`h-2.5 w-32 rounded ${skeleton}`} />
                <div className={`h-2.5 w-28 rounded ${skeleton}`} />
                <div className={`h-2.5 w-24 rounded ${skeleton}`} />
              </nav>
            </aside>

            {/* Main content */}
            <div className="space-y-4">
              {/* Basic Information */}
              <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div className={`h-4 w-4 rounded ${skeleton}`} />
                  <div className={`h-3 w-28 rounded ${skeleton}`} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className={`h-2 w-16 rounded ${skeleton}`} />
                      <div className={`h-9 w-full rounded-md ${skeleton}`} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Account */}
              <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div className={`h-4 w-4 rounded ${skeleton}`} />
                  <div className={`h-3 w-20 rounded ${skeleton}`} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className={`h-2 w-16 rounded ${skeleton}`} />
                  <div className={`h-9 w-full rounded-md ${skeleton}`} />
                  <div className={`h-2 w-72 max-w-full rounded ${skeleton}`} />
                </div>
              </section>

              {/* Skills */}
              <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div className={`h-4 w-4 rounded ${skeleton}`} />
                  <div className={`h-3 w-16 rounded ${skeleton}`} />
                </div>

                <div className={`mt-4 h-2.5 w-24 rounded ${skeleton}`} />

                <div className="mt-4 flex gap-2">
                  <div className={`h-9 flex-1 rounded-md ${skeleton}`} />
                  <div className={`h-9 w-16 rounded-md ${skeleton}`} />
                </div>
              </section>

              {/* Resume */}
              <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div className={`h-4 w-4 rounded ${skeleton}`} />
                  <div className={`h-3 w-32 rounded ${skeleton}`} />
                </div>

                <div className="mt-4 rounded-md border border-dashed border-slate-300 p-4 dark:border-slate-600">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className={`h-3 w-40 rounded ${skeleton}`} />
                      <div
                        className={`h-2.5 w-72 max-w-full rounded ${skeleton}`}
                      />
                    </div>

                    <div className={`h-9 w-28 rounded-md ${skeleton}`} />
                  </div>
                </div>
              </section>

              {/* Experience & Education */}
              <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div className={`h-4 w-4 rounded ${skeleton}`} />
                  <div className={`h-3 w-40 rounded ${skeleton}`} />
                </div>

                <div className="mt-4 space-y-3">
                  <div className={`h-11 w-full rounded-md ${skeleton}`} />
                  <div className={`h-11 w-full rounded-md ${skeleton}`} />
                </div>
              </section>

              {/* Professional Links */}
              <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#080f1e]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div className={`h-4 w-4 rounded ${skeleton}`} />
                  <div className={`h-3 w-32 rounded ${skeleton}`} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className={`h-2 w-16 rounded ${skeleton}`} />
                      <div className={`h-9 w-full rounded-md ${skeleton}`} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-[#080f1e]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-3 lg:px-6">
          <div className={`h-3 w-24 rounded ${skeleton}`} />
          <div className={`h-9 w-20 rounded-md ${skeleton}`} />
          <div className={`h-9 w-28 rounded-md ${skeleton}`} />
        </div>
      </div>
    </div>
  );
}
