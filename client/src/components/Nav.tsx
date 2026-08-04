"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Nav() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-800">
          Credify
        </Link>

        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
            Job Search
          </Link>

          {/* Role-specific links only appear once we actually know who's
              logged in — never rendered during the loading state, to
              avoid a flash of the wrong nav before session restore
              finishes. */}
          {!isLoading && user?.role === "candidate" && (
            <>
              <Link
                href="/candidate/profile"
                className="text-slate-600 hover:text-slate-900"
              >
                My Profile
              </Link>
              <Link
                href="/candidate/applications"
                className="text-slate-600 hover:text-slate-900"
              >
                Applications
              </Link>
            </>
          )}

          {!isLoading && user?.role === "recruiter" && (
            <>
              <Link
                href="/recruiter/jobs"
                className="text-slate-600 hover:text-slate-900"
              >
                My Jobs
              </Link>
              <Link
                href="/recruiter/company"
                className="text-slate-600 hover:text-slate-900"
              >
                Company
              </Link>
            </>
          )}

          {!isLoading && user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-slate-600 hover:text-slate-900"
            >
              Admin
            </Link>
          )}

          {!isLoading && !user && (
            <Link
              href="/register"
              className="text-slate-600 hover:text-slate-900"
            >
              For Employers
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          {isLoading ? (
            // Reserves the same height as the logged-in/out states below,
            // so the header doesn't visibly jump once loading resolves.
            <div className="h-8 w-20" />
          ) : user ? (
            <>
              <span className="hidden text-slate-500 sm:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-700 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
