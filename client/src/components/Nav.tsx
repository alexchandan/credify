import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-800">
          Credify
        </Link>

        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <Link
            href="/jobs"
            className="border-b-2 border-blue-700 pb-1 font-medium text-blue-700"
          >
            Job Search
          </Link>
          <Link
            href="/register"
            className="text-slate-600 hover:text-slate-900"
          >
            For Employers
          </Link>
        </nav>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/login" className="text-slate-700 hover:text-slate-900">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
