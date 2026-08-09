"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";

export function Nav() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedUnreadCount, setFetchedUnreadCount] = useState<number | null>(
    null,
  );
  const unreadCount = user ? fetchedUnreadCount : null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Real unread count from the actual notifications endpoint — not a
  // decorative always-on dot. Mounted route is /notification (singular),
  // matching this backend's current naming, not the /notifications
  // convention the rest of the API uses.
  useEffect(() => {
    if (!user) return;
    apiRequest<unknown[]>("/notification/me?limit=1")
      .then((result) => {
        const count = result.meta?.unreadCount;
        setFetchedUnreadCount(typeof count === "number" ? count : null);
      })
      .catch(() => setFetchedUnreadCount(null));
  }, [user]);

  // Click-outside-to-close for the avatar dropdown.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("skill", searchQuery);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  async function handleLogout() {
    setIsMenuOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold text-blue-700">
          Credify
        </Link>

        {!isLoading && user && (
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            {user.role === "candidate" && (
              <>
                <Link
                  href="/jobs"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Find Jobs
                </Link>
                <Link
                  href="/candidate/applications"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Applications
                </Link>
              </>
            )}
            {user.role === "recruiter" && (
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
            {user.role === "admin" && (
              <Link
                href="/admin/users"
                className="text-slate-600 hover:text-slate-900"
              >
                Users
              </Link>
            )}
          </nav>
        )}

        {!isLoading && !user && (
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
              Job Search
            </Link>
            <Link
              href="/register"
              className="text-slate-600 hover:text-slate-900"
            >
              For Employers
            </Link>
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-4">
          {!isLoading && user && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden max-w-xs flex-1 sm:block"
            >
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="h-9 w-24" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Bell shows the real unread count. Not yet a clickable
                  dropdown of individual notifications — no notifications
                  page/panel has been built yet, only the count itself is
                  real right now. */}
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-500" strokeWidth={2} />
                {unreadCount !== null && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full py-1 pr-1 pl-1 hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-medium text-white">
                    {user.email[0]?.toUpperCase()}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
                      {user.email}
                    </div>

                    {user.role === "candidate" && (
                      <Link
                        href="/candidate/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Profile
                      </Link>
                    )}

                    {user.role === "candidate" && (
                      // Real anchor into the profile page's actual Account
                      // Settings section — not a separate, invented page.
                      <Link
                        href="/candidate/profile#account-settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
