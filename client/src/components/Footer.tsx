"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  const { user } = useAuth();
  const isCandidate = user?.role === "candidate";
  const isRecruiter = user?.role === "recruiter";

  return (
    <footer className="border-t border-slate-200/80 bg-slate-950 px-6 py-14 text-slate-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-xl font-bold tracking-tight text-white">
              Cre
              <span className="bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                di
              </span>
              fy
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-400 dark:text-slate-400">
            Helping professionals find real roles at real companies — verified,
            transparent, and built for clarity.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
            Platform
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link
                href="/jobs"
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                Find Jobs
              </Link>
            </li>
            {isCandidate || isRecruiter ? (
              <li>
                <Link
                  href={
                    isCandidate
                      ? "/candidate/dashboard"
                      : "/recruiter/dashboard"
                  }
                  className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  Post a Role
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
            Account
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {isCandidate ? (
              <>
                <li>
                  <Link
                    href="/candidate/profile"
                    className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    My profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candidate/profile#account-settings"
                    className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    Account settings
                  </Link>
                </li>
              </>
            ) : isRecruiter ? (
              <>
                <li>
                  <Link
                    href="/recruiter/profile"
                    className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    My profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/recruiter/profile#account-settings"
                    className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    Account settings
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-800/80 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-500">
        © {new Date().getFullYear()} Credify. All rights reserved.
      </div>
    </footer>
  );
}
