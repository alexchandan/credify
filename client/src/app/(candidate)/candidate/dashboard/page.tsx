"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileText,
  Inbox,
  LoaderCircle,
  MapPin,
  RefreshCw,
  UserRoundCheck,
} from "lucide-react";
import {
  APPLICATION_STATUSES,
  STATUS_DETAILS,
} from "@/components/applications/statusMeta";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { addCompanyNames, formatJobLabel } from "@/lib/jobData";
import { getErrorMessage } from "@/lib/formErrors";
import CandidateDashboardSkeleton from "@/components/ui/skeletons/CandidateDashboardSkeleton";
import type {
  ApplicationStatus,
  CandidateDashboard,
  DashboardNotification,
  RecentApplication,
} from "@/types/dashboard";
import type { Job, JobWithCompany } from "@/types/job";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function firstName(fullName?: string): string {
  return fullName?.trim().split(/\s+/)[0] || "there";
}

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<CandidateDashboard | null>(null);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areJobsLoading, setAreJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const dashboardResult = await apiRequest<CandidateDashboard>(
          "/dashboard/candidate",
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setDashboard(dashboardResult.data);
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    function handleNotificationsRead() {
      setDashboard((current) =>
        current
          ? {
              ...current,
              unreadNotificationsCount: 0,
              recentNotifications: current.recentNotifications.map(
                (notification) => ({
                  ...notification,
                  isRead: true,
                  readAt: notification.readAt ?? new Date().toISOString(),
                }),
              ),
            }
          : current,
      );
    }

    window.addEventListener(
      "credify:notifications-read",
      handleNotificationsRead,
    );
    return () =>
      window.removeEventListener(
        "credify:notifications-read",
        handleNotificationsRead,
      );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setAreJobsLoading(true);
      try {
        const jobsResult = await apiRequest<Job[]>("/jobs?limit=3", {
          skipAuth: true,
          signal: controller.signal,
        });
        const enrichedJobs = await addCompanyNames(
          jobsResult.data,
          controller.signal,
        );
        if (!controller.signal.aborted) setJobs(enrichedJobs);
      } catch {
        if (!controller.signal.aborted) setJobs([]);
      } finally {
        if (!controller.signal.aborted) setAreJobsLoading(false);
      }
    }

    loadJobs();
    return () => controller.abort();
  }, [reloadKey]);

  async function markAllNotificationsRead() {
    if (!dashboard || dashboard.unreadNotificationsCount === 0) return;
    setIsMarkingRead(true);
    setNotificationError(null);
    try {
      await apiRequest("/notification/read-all", { method: "PATCH" });
      setDashboard({
        ...dashboard,
        unreadNotificationsCount: 0,
        recentNotifications: dashboard.recentNotifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt ?? new Date().toISOString(),
          }),
        ),
      });
      window.dispatchEvent(new Event("credify:notifications-read"));
    } catch (err) {
      setNotificationError(getErrorMessage(err));
    } finally {
      setIsMarkingRead(false);
    }
  }

  if (isLoading) return <CandidateDashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-900">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center dark:border-red-900 dark:bg-slate-950">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" />
          <h1 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
            We couldn&apos;t load your dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error ?? "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statusCount = (status: ApplicationStatus) =>
    dashboard.applications.byStatus[status] ?? 0;
  const activeApplications =
    statusCount("applied") +
    statusCount("under_review") +
    statusCount("shortlisted");

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
              Candidate dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
              Welcome back, {firstName(user?.fullName)}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Track your search and focus on the next useful step.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Browse jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section
          aria-label="Search overview"
          className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={BriefcaseBusiness}
            label="Applications"
            value={dashboard.applications.total}
            detail="Submitted roles"
            tone="blue"
          />
          <StatCard
            icon={Clock3}
            label="Active pipeline"
            value={activeApplications}
            detail="Applied, review, or shortlist"
            tone="amber"
          />
          <StatCard
            icon={UserRoundCheck}
            label="Profile strength"
            value={`${dashboard.profileCompletionPercent}%`}
            detail={
              dashboard.profileCompletionPercent === 100
                ? "Profile complete"
                : "Keep improving"
            }
            tone="orange"
          />
          <StatCard
            icon={Bell}
            label="Unread updates"
            value={dashboard.unreadNotificationsCount}
            detail="Application notifications"
            tone="emerald"
          />
        </section>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
          <div className="min-w-0 space-y-6">
            <ApplicationsSection
              applications={dashboard.recentApplications}
              byStatus={dashboard.applications.byStatus}
              total={dashboard.applications.total}
            />
            <JobsSection jobs={jobs} isLoading={areJobsLoading} />
          </div>

          <aside className="min-w-0 space-y-6">
            <ProfileReadiness
              percent={dashboard.profileCompletionPercent}
              hasResume={dashboard.resumeStatus.hasResume}
            />
            <ResumePanel resume={dashboard.resumeStatus} />
            <NotificationsPanel
              notifications={dashboard.recentNotifications}
              unreadCount={dashboard.unreadNotificationsCount}
              isMarkingRead={isMarkingRead}
              error={notificationError}
              onMarkAllRead={markAllNotificationsRead}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string | number;
  detail: string;
  tone: "blue" | "amber" | "orange" | "emerald";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    amber:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    orange:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  };

  return (
    <article className="flex min-h-28 items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
          {value}
        </p>
        <p className="mt-0.5 text-xs leading-4 text-slate-400 dark:text-slate-500">
          {detail}
        </p>
      </div>
    </article>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <div>
        <h2 className="font-semibold text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function ApplicationsSection({
  applications,
  byStatus,
  total,
}: {
  applications: RecentApplication[];
  byStatus: CandidateDashboard["applications"]["byStatus"];
  total: number;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <SectionHeading
        title="Application activity"
        description="Your latest submissions and current pipeline"
      />

      {total > 0 && (
        <div className="grid grid-cols-3 gap-px border-b border-slate-100 bg-slate-100 sm:grid-cols-6 dark:border-slate-800 dark:bg-slate-800">
          {APPLICATION_STATUSES.map((status) => (
            <div key={status} className="bg-white px-3 py-3 dark:bg-slate-950">
              <p className="text-lg font-bold text-slate-950 dark:text-white">
                {byStatus[status] ?? 0}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                {STATUS_DETAILS[status].label}
              </p>
            </div>
          ))}
        </div>
      )}

      {applications.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {applications.map((application) => (
            <ApplicationRow key={application._id} application={application} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No applications yet"
          description="Your submitted roles will appear here with live status updates."
          href="/jobs"
          action="Find your first role"
        />
      )}
    </section>
  );
}

function ApplicationRow({ application }: { application: RecentApplication }) {
  const status = STATUS_DETAILS[application.status];
  const StatusIcon = status.icon;
  const content = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {application.jobTitle ?? "Role no longer available"}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          Applied {formatDate(application.createdAt)}
        </p>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}
      >
        <StatusIcon className="h-3.5 w-3.5" />
        {status.label}
      </span>
    </>
  );

  return application.jobTitle ? (
    <Link
      href={`/jobs/${application.jobId}`}
      className="focus-visible:outline-inset flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-500 dark:hover:bg-slate-900"
    >
      {content}
    </Link>
  ) : (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      {content}
    </div>
  );
}

function ProfileReadiness({
  percent,
  hasResume,
}: {
  percent: number;
  hasResume: boolean;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Profile readiness
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Recruiter-facing essentials
          </p>
        </div>
        <span className="text-xl font-bold text-orange-700 dark:text-orange-400">
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Profile completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      >
        <div
          className="h-full rounded-full bg-orange-600"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <ReadinessItem
          complete={percent === 100}
          label={
            percent === 100
              ? "Core profile complete"
              : "Complete your core profile"
          }
        />
        <ReadinessItem
          complete={hasResume}
          label={
            hasResume
              ? "Resume ready for applications"
              : "Resume still required"
          }
        />
      </div>
      <Link
        href="/candidate/profile"
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        Update profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function ReadinessItem({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
      {complete ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <CircleDot className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      )}
      <span>{label}</span>
    </div>
  );
}

function ResumePanel({
  resume,
}: {
  resume: CandidateDashboard["resumeStatus"];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${resume.hasResume ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"}`}
        >
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            {resume.hasResume ? "Resume ready" : "Resume missing"}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {resume.hasResume
              ? resume.uploadedAt
                ? `Updated ${formatDate(resume.uploadedAt)}`
                : "Available for new applications"
              : "Upload a PDF before submitting an application."}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {resume.hasResume && resume.resumeUrl && (
          <a
            href={resume.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
        <Link
          href="/candidate/profile#resume"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-orange-600 px-3 text-xs font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {resume.hasResume ? "Replace" : "Upload resume"}
        </Link>
      </div>
    </section>
  );
}

function NotificationsPanel({
  notifications,
  unreadCount,
  isMarkingRead,
  error,
  onMarkAllRead,
}: {
  notifications: DashboardNotification[];
  unreadCount: number;
  isMarkingRead: boolean;
  error: string | null;
  onMarkAllRead: () => void;
}) {
  return (
    <section
      id="updates"
      className="scroll-mt-24 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <SectionHeading
        title="Recent updates"
        description={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={isMarkingRead}
              title="Mark all notifications as read"
              aria-label="Mark all notifications as read"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isMarkingRead ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
          ) : undefined
        }
      />
      {error && (
        <p
          role="alert"
          className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {notifications.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((notification) => (
            <div key={notification._id} className="flex gap-3 px-5 py-4">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-slate-300 dark:bg-slate-700" : "bg-orange-600"}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm leading-5 ${notification.isRead ? "text-slate-600 dark:text-slate-400" : "font-medium text-slate-900 dark:text-slate-100"}`}
                >
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <Bell className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-700" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No updates yet
          </p>
        </div>
      )}
    </section>
  );
}

function JobsSection({
  jobs,
  isLoading,
}: {
  jobs: JobWithCompany[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section
        aria-label="Loading new opportunities"
        aria-busy="true"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      >
        <SectionHeading
          title="New opportunities"
          description="Recently published roles"
        />
        <div className="space-y-px bg-slate-100 dark:bg-slate-800">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-18 animate-pulse bg-white dark:bg-slate-950"
            />
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <SectionHeading
        title="New opportunities"
        description="Recently published roles"
        action={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {jobs.map((job) => (
          <Link
            key={job._id}
            href={`/jobs/${job._id}`}
            className="focus-visible:outline-inset flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-500 dark:hover:bg-slate-900"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {job.title}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {job.companyName}
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {formatJobLabel(job.employmentType)}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500">
                <MapPin className="h-3 w-3" />
                {job.isRemote ? "Remote" : job.location[0] || "Flexible"}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-orange-400"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
