import Link from "next/link";
import { SearchX, Home, Briefcase } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="flex flex-1 flex-col bg-slate-50/70 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-100/80 bg-cyan-50 text-cyan-600 shadow-sm dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
            <SearchX className="h-9 w-9" strokeWidth={1.75} />
          </div>

          <h1 className="mt-6 bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent dark:from-[#22d3ee] dark:to-[#38d996]">
            404
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Page not found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-500 via-cyan-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-cyan-500 hover:shadow-lg active:scale-[0.99]"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-500/60 dark:hover:text-cyan-400"
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
