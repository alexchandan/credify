import Link from "next/link";
import { SearchX, Home, Briefcase } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-lg font-bold text-slate-900">
            Credify
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <SearchX className="h-9 w-9 text-slate-400" strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900">
          404
        </h1>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
