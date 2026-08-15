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
  Check,
  LoaderCircle,
} from "lucide-react";
import logo from "@/../public/logo.png";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  href: string;
  label: string;
}

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function shortDate(value: string): string {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function navItemsFor(user: AuthUser | null): NavItem[] {
  if (user?.role === "candidate") {
    return [
      { href: "/candidate/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Browse jobs" },
      { href: "/candidate/profile", label: "My profile" },
    ];
  }
  if (user?.role === "recruiter") {
    return [
      { href: "/recruiter/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Browse jobs" },
      { href: "/recruiter/profile", label: "My profile" },
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] =
    useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
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
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
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
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
        setIsNotificationsOpen(false);
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

  useEffect(() => {
    if (!isNotificationsOpen || !user) return;
    let cancelled = false;
    async function loadNotifications() {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        const result = await apiRequest<Notification[]>(
          "/notification/me?limit=8",
        );
        if (!cancelled) setNotifications(result.data);
      } catch (err) {
        if (!cancelled) {
          setNotificationsError(
            err instanceof Error
              ? err.message
              : "Unable to load notifications.",
          );
        }
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    }
    void loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [isNotificationsOpen, user]);

  async function markAllNotificationsRead() {
    if (!unreadCount) return;
    setIsMarkingNotificationsRead(true);
    try {
      await apiRequest("/notification/read-all", { method: "PATCH" });
      setNotificationState(user ? { userId: user.id, count: 0 } : null);
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
      window.dispatchEvent(new Event("credify:notifications-read"));
    } catch (err) {
      setNotificationsError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications read.",
      );
    } finally {
      setIsMarkingNotificationsRead(false);
    }
  }

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

          {!isLoading && user && (
            <div className="relative" ref={notificationMenuRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((open) => !open)}
                aria-label="Open notifications"
                aria-expanded={isNotificationsOpen}
                aria-controls="notifications-menu"
                title="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount !== null && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div
                  id="notifications-menu"
                  role="region"
                  aria-label="Notifications"
                  className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Notifications
                    </h2>
                    {unreadCount ? (
                      <button
                        type="button"
                        onClick={() => void markAllNotificationsRead()}
                        disabled={isMarkingNotificationsRead}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 disabled:opacity-50 dark:text-orange-400"
                      >
                        {isMarkingNotificationsRead ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Mark all as read
                      </button>
                    ) : null}
                  </div>
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      Loading notifications...
                    </div>
                  ) : notificationsError ? (
                    <p
                      role="alert"
                      className="px-4 py-8 text-center text-sm text-red-700 dark:text-red-300"
                    >
                      {notificationsError}
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No notifications yet.
                    </p>
                  ) : (
                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`px-4 py-3 ${notification.isRead ? "" : "bg-orange-50/60 dark:bg-orange-950/20"}`}
                        >
                          <p
                            className={`text-sm leading-5 ${notification.isRead ? "text-slate-600 dark:text-slate-400" : "font-medium text-slate-900 dark:text-slate-100"}`}
                          >
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {shortDate(notification.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                  {user.role === "recruiter" && (
                    <>
                      <Link
                        href="/recruiter/dashboard"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/recruiter/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <UserIcon className="h-4 w-4" />
                        My profile
                      </Link>
                      <Link
                        href="/recruiter/profile#account-settings"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4" />
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
