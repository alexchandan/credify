"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User as UserIcon,
  X,
} from "lucide-react";
import logo from "@/../public/logo.png";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  href: string;
  label: string;
}

function navItemsFor(user: AuthUser | null): NavItem[] {
  if (user?.role === "candidate") {
    return [
      { href: "/candidate/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Browse jobs" },
      { href: "/candidate/profile", label: "My profile" },
    ];
  }

  const items: NavItem[] = [{ href: "/jobs", label: "Browse jobs" }];
  if (!user) {
    items.push({ href: "/register", label: "For employers" });
  }
  return items;
}

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 ${
        isActive
          ? "text-orange-700 dark:text-orange-400"
          : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

function UserAvatar({
  user,
  size = "sm",
}: {
  user: AuthUser;
  size?: "sm" | "md";
}) {
  const dimensions = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const initial = (user.fullName || user.email)[0]?.toUpperCase() ?? "U";

  return user.avatarUrl ? (
    <Image
      src={user.avatarUrl}
      alt=""
      width={40}
      height={40}
      className={`${dimensions} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700`}
    />
  ) : (
    <span
      className={`flex ${dimensions} items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

export function Nav() {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationState, setNotificationState] = useState<{
    userId: string;
    count: number | null;
  } | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const navItems = navItemsFor(user);
  const unreadCount =
    user && notificationState?.userId === user.id
      ? notificationState.count
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!user) return () => undefined;
    const userId = user.id;

    function handleNotificationsRead() {
      setNotificationState({ userId, count: 0 });
    }

    apiRequest<unknown[]>("/notification/me?limit=1")
      .then((result) => {
        if (cancelled) return;
        const count = result.meta?.unreadCount;
        setNotificationState({
          userId,
          count: typeof count === "number" ? count : null,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setNotificationState({ userId, count: null });
        }
      });

    window.addEventListener(
      "credify:notifications-read",
      handleNotificationsRead,
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        "credify:notifications-read",
        handleNotificationsRead,
      );
    };
  }, [user]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSearchSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/jobs?q=${encodeURIComponent(query)}` : "/jobs");
    setIsMobileMenuOpen(false);
  }

  async function handleLogout() {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    try {
      await logout();
    } catch {
      // AuthContext clears local state even when the server cannot respond.
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Credify home"
          className="flex shrink-0 items-center gap-2 text-xl font-extrabold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 dark:text-white"
        >
          <Image
            src={logo}
            alt=""
            className="h-8 w-8 object-contain"
            priority
          />
          <span>
            Cre<span className="text-orange-600">di</span>fy
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="ml-5 hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="relative hidden w-52 lg:block"
          >
            <label htmlFor="header-job-search" className="sr-only">
              Search jobs
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              id="header-job-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search jobs"
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pr-3 pl-9 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 dark:focus:ring-orange-900/50"
            />
          </form>

          <ThemeToggle />

          {!isLoading &&
            user &&
            (user.role === "candidate" ? (
              <Link
                href="/candidate/dashboard#updates"
                aria-label={
                  unreadCount === null
                    ? "View notifications"
                    : `View ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                }
                title="View notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount !== null && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <span
                role="status"
                aria-label={
                  unreadCount === null
                    ? "Notification count unavailable"
                    : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                }
                title="Unread notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-600 dark:text-slate-300"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount !== null && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
            ))}

          {isLoading ? (
            <div className="hidden h-10 w-28 animate-pulse rounded-lg bg-slate-100 md:block dark:bg-slate-800" />
          ) : user ? (
            <div className="relative hidden md:block" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={isAccountMenuOpen}
                aria-controls="account-menu"
                className="flex h-10 items-center gap-2 rounded-lg px-1.5 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserAvatar user={user} />
                <ChevronDown
                  className={`h-4 w-4 transition ${isAccountMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
                <span className="sr-only">Open account menu</span>
              </button>

              {isAccountMenuOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user.fullName ?? user.email}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>

                  {user.role === "candidate" && (
                    <>
                      <Link
                        href="/candidate/dashboard"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <LayoutDashboard
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Dashboard
                      </Link>
                      <Link
                        href="/candidate/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <UserIcon className="h-4 w-4" aria-hidden="true" />
                        My profile
                      </Link>
                      <Link
                        href="/candidate/profile#account-settings"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        Account settings
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-orange-600 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-orange-400 dark:hover:bg-orange-950/40"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={
              isMobileMenuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="relative"
          >
            <label htmlFor="mobile-job-search" className="sr-only">
              Search jobs
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              id="mobile-job-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search jobs"
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pr-3 pl-9 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-950 dark:focus:ring-orange-900/50"
            />
          </form>

          <nav
            aria-label="Mobile navigation"
            className="mt-4 flex flex-col items-start gap-4 border-b border-slate-100 pb-4 dark:border-slate-800"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>

          {!isLoading && user ? (
            <div className="pt-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user.fullName ?? user.email}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : !isLoading ? (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-orange-600 text-sm font-semibold text-orange-700 dark:text-orange-400"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
}
