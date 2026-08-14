"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  const { user } = useAuth();
  const isCandidate = user?.role === "candidate";

  return (
    <footer className="bg-slate-900 px-6 py-12 text-slate-300 dark:bg-black dark:text-slate-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <span className="text-xl font-bold text-white">Credify</span>
          <p className="mt-3 max-w-xs text-sm text-slate-400 dark:text-slate-500">
            Helping professionals find real roles at real companies — verified,
            transparent, and built for clarity.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Platform</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link
                href="/jobs"
                className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                Find Jobs
              </Link>
            </li>
            {isCandidate ? (
              <li>
                <Link
                  href="/candidate/dashboard"
                  className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/register"
                  className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  Post a Role
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Account</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {isCandidate ? (
              <>
                <li>
                  <Link
                    href="/candidate/profile"
                    className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    My profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candidate/profile#account-settings"
                    className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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
                    className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-700 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {new Date().getFullYear()} Credify. All rights reserved.
      </div>
    </footer>
  );
}
