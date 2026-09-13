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
  Bookmark,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { apiRequest, getCurrentAccessToken } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { DashboardNotification } from "@/types/dashboard";
import { NotificationSkeleton } from "./ui/skeletons/NotificationSkeleton";

interface NavItem {
  href: string;
  label: string;
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

function navItemsFor(user: AuthUser | null, pathname: string): NavItem[] {
  const role =
    user?.role ??
    (pathname.startsWith("/candidate")
      ? "candidate"
      : pathname.startsWith("/recruiter")
        ? "recruiter"
        : null);

  if (role === "candidate") {
    return [
      { href: "/candidate/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Browse jobs" },
      { href: "/candidate/applications", label: "My applications" },
      { href: "/candidate/profile", label: "My profile" },
    ];
  }
  if (role === "recruiter") {
    return [
      { href: "/recruiter/dashboard", label: "Dashboard" },
      { href: "/recruiter/candidates", label: "Find Talent" },
      { href: "/recruiter/saved-candidates", label: "Saved Talent" },
      { href: "/recruiter/jobs", label: "Manage jobs" },
      { href: "/recruiter/profile", label: "Company profile" },
    ];
  }

  const items: NavItem[] = [{ href: "/jobs", label: "Browse jobs" }];
  if (!user && !role) {
    items.push({ href: "/register?role=recruiter", label: "For employers" });
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
      className={`text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 ${
        isActive
          ? "font-semibold text-indigo-600 dark:text-indigo-400"
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
      className={`flex ${dimensions} items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-700 text-xs font-bold text-slate-950 shadow-sm`}
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
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    [],
  );
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] =
    useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const isProtectedPath =
    pathname.startsWith("/candidate") || pathname.startsWith("/recruiter");
  const showAuthSkeleton = !user && (isLoading || isProtectedPath);
  const navItems = navItemsFor(user, pathname);
  const unreadCount =
    user && notificationState?.userId === user.id
      ? notificationState.count
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!user || isLoading) return () => undefined;
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

    // Real-time notification SSE stream
    let eventSource: EventSource | null = null;
    const token = getCurrentAccessToken();
    if (token && typeof window !== "undefined") {
      try {
        eventSource = new EventSource(
          `${API_BASE_URL}/notification/stream?token=${encodeURIComponent(token)}`,
        );

        eventSource.addEventListener("notification", (e) => {
          if (cancelled) return;
          try {
            const data = JSON.parse(e.data);
            setNotificationState((prev) => ({
              userId,
              count: (prev?.count ?? 0) + 1,
            }));
            setNotifications((prev) => [
              {
                _id: String(data.relatedEntityId || Date.now()),
                userId,
                type: data.type,
                message: data.message,
                isRead: false,
                readAt: null,
                relatedEntityType: data.relatedEntityType,
                relatedEntityId: data.relatedEntityId,
                createdAt: data.createdAt || new Date().toISOString(),
              },
              ...prev,
            ]);
            window.dispatchEvent(
              new CustomEvent("credify:notification-received", {
                detail: data,
              }),
            );
          } catch {
            // ignore
          }
        });

        eventSource.addEventListener("application_received", (e) => {
          if (cancelled) return;
          try {
            const data = JSON.parse(e.data);
            window.dispatchEvent(
              new CustomEvent("credify:application-received", { detail: data }),
            );
          } catch {
            // ignore
          }
        });

        eventSource.addEventListener("application_status_updated", (e) => {
          if (cancelled) return;
          try {
            const data = JSON.parse(e.data);
            window.dispatchEvent(
              new CustomEvent("credify:application-status-updated", {
                detail: data,
              }),
            );
          } catch {
            // ignore
          }
        });
      } catch {
        // SSE not supported or network error
      }
    }

    window.addEventListener(
      "credify:notifications-read",
      handleNotificationsRead,
    );

    return () => {
      cancelled = true;
      if (eventSource) {
        eventSource.close();
      }
      window.removeEventListener(
        "credify:notifications-read",
        handleNotificationsRead,
      );
    };
  }, [isLoading, user]);

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
    if (!isNotificationsOpen || !user || isLoading) return;
    let cancelled = false;
    async function loadNotifications() {
      setNotificationsLoading(true);
      setNotificationsLoaded(false);
      setNotificationsError(null);
      try {
        const result = await apiRequest<DashboardNotification[]>(
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
        if (!cancelled) {
          setNotificationsLoading(false);
          setNotificationsLoaded(true);
        }
      }
    }
    void loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [isLoading, isNotificationsOpen, user]);

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

  function toggleNotifications() {
    const willOpen = !isNotificationsOpen;
    if (willOpen) {
      setIsMobileMenuOpen(false);
      setIsAccountMenuOpen(false);
      setNotificationsLoaded(false);
      setNotificationsLoading(true);
      setNotificationsError(null);
      setNotifications([]);
    }
    setIsNotificationsOpen(willOpen);
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
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Credify home"
          className="group flex shrink-0 items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 dark:text-white"
        >
          <Logo
            size={30}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span>
            Cre
            <span className="bg-linear-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent dark:from-[#22d3ee] dark:to-[#67e8f9]">
              di
            </span>
            fy
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
              className="h-10 w-full rounded-lg border border-slate-300/90 bg-slate-50 pr-3 pl-9 text-sm text-slate-950 transition outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-white dark:focus:bg-slate-950 dark:focus:ring-cyan-500/30"
            />
          </form>

          <ThemeToggle />

          {user ? (
            <div className="relative" ref={notificationMenuRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label={
                  unreadCount === null
                    ? "Open notifications"
                    : unreadCount === 1
                      ? "Open notifications, 1 unread"
                      : `Open notifications, ${unreadCount} unread`
                }
                aria-expanded={isNotificationsOpen}
                aria-controls="notifications-menu"
                title="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount !== null && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-xs sm:hidden"
                    onClick={() => setIsNotificationsOpen(false)}
                    aria-hidden="true"
                  />

                  <div
                    id="notifications-menu"
                    role="region"
                    aria-label="Notifications"
                    className="fixed inset-x-3 top-16 z-50 flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:max-h-none sm:w-88 dark:border-slate-800 dark:bg-slate-900/95"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Notifications
                        </h2>
                        {unreadCount !== null && unreadCount > 0 && (
                          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {unreadCount ? (
                          <button
                            type="button"
                            onClick={() => void markAllNotificationsRead()}
                            disabled={isMarkingNotificationsRead}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 disabled:opacity-50 dark:text-cyan-400 dark:hover:text-cyan-300"
                          >
                            {isMarkingNotificationsRead ? (
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Mark all read
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setIsNotificationsOpen(false)}
                          aria-label="Close notifications"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {notificationsLoading || !notificationsLoaded ? (
                      <NotificationSkeleton />
                    ) : notificationsError ? (
                      <p
                        role="alert"
                        className="flex min-h-72 items-center justify-center px-4 py-8 text-center text-sm text-rose-600 dark:text-rose-400"
                      >
                        {notificationsError}
                      </p>
                    ) : notifications.length === 0 ? (
                      <div className="flex min-h-72 flex-col items-center justify-center px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        <Bell className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="mt-2 text-sm font-medium">
                          No notifications yet
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                          Updates on applications and roles will show up here.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-88 min-h-72 divide-y divide-slate-100 overflow-y-auto overscroll-contain dark:divide-slate-800">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`flex items-start gap-3 px-4 py-3.5 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                              notification.isRead
                                ? ""
                                : "bg-cyan-50/50 dark:bg-cyan-950/20"
                            }`}
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                notification.isRead
                                  ? "bg-transparent"
                                  : "bg-cyan-500 shadow-xs shadow-cyan-500/50"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs leading-relaxed wrap-break-word sm:text-sm ${
                                  notification.isRead
                                    ? "text-slate-600 dark:text-slate-400"
                                    : "font-semibold text-slate-900 dark:text-slate-100"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                {shortDate(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : showAuthSkeleton ? (
            <div
              className="h-10 w-10 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-800/60"
              aria-hidden="true"
            />
          ) : null}

          {user ? (
            <div className="relative hidden md:block" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={isAccountMenuOpen}
                aria-controls="account-menu"
                className="flex h-10 items-center gap-2 rounded-lg px-1.5 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800"
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
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 py-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
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
                        href="/recruiter/candidates"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Users className="h-4 w-4" />
                        Find Talent
                      </Link>
                      <Link
                        href="/recruiter/saved-candidates"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Bookmark className="h-4 w-4" />
                        Saved Candidates
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
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : showAuthSkeleton ? (
            <div
              className="hidden items-center gap-2 md:flex"
              aria-hidden="true"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300/80 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 text-white shadow-sm shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99] dark:from-cyan-500 dark:via-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:shadow-cyan-500/25 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
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
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"
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
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pr-3 pl-9 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-950 dark:focus:ring-cyan-500/30"
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

          {user ? (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleNotifications();
                }}
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Notifications</span>
                </div>
                {unreadCount !== null && unreadCount > 0 ? (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="text-xs font-normal text-slate-400">
                    All caught up
                  </span>
                )}
              </button>

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
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800/80 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : showAuthSkeleton ? (
            <div className="flex items-center gap-3 pt-4" aria-hidden="true">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
                <div className="h-2.5 w-36 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-linear-to-r from-cyan-600 to-cyan-700 text-sm font-semibold text-white shadow-sm dark:from-cyan-500 dark:to-cyan-600 dark:text-slate-950"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
