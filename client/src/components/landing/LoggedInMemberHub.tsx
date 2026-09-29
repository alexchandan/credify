"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { STATUS_DETAILS } from "@/components/applications/statusMeta";
import type { AuthUser } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { formatIndianDate, formatIndianNumber } from "@/lib/formatters";
import { formatJobLabel, formatSalary } from "@/lib/jobData";
import { getErrorMessage } from "@/lib/formErrors";
import type {
  AdminDashboard,
  ApplicationStatus,
  CandidateDashboard,
  RecentApplication,
  RecruiterDashboard,
} from "@/types/dashboard";
import type { Job, JobWithCompany } from "@/types/job";
import type { PublicLandingSummary } from "@/types/landing";

interface LoggedInMemberHubProps {
  user: AuthUser;
}

interface CandidateHubData {
  kind: "candidate";
  dashboard: CandidateDashboard;
  jobs: JobWithCompany[];
}

interface RecruiterHubData {
  kind: "recruiter";
  dashboard: RecruiterDashboard;
  jobs: Job[];
}

interface AdminHubData {
  kind: "admin";
  dashboard: AdminDashboard;
}

type HubData = CandidateHubData | RecruiterHubData | AdminHubData;

function firstName(user: AuthUser): string {
  return (
    user.fullName?.trim().split(/\s+/)[0] || user.email.split("@")[0] || "there"
  );
}

export function LoggedInMemberHub({ user }: LoggedInMemberHubProps) {
  const [data, setData] = useState<HubData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHub() {
      setIsLoading(true);
      setError(null);

      try {
        if (user.role === "candidate") {
          const [dashboardResult, publicResult] = await Promise.all([
            apiRequest<CandidateDashboard>("/dashboard/candidate", {
              signal: controller.signal,
            }),
            apiRequest<PublicLandingSummary>("/dashboard/public", {
              skipAuth: true,
              signal: controller.signal,
            }),
          ]);
          if (!controller.signal.aborted) {
            setData({
              kind: "candidate",
              dashboard: dashboardResult.data,
              jobs: publicResult.data.featuredJobs.slice(0, 5),
            });
          }
          return;
        }

        if (user.role === "recruiter") {
          const [dashboardResult, jobsResult] = await Promise.all([
            apiRequest<RecruiterDashboard>("/dashboard/recruiter", {
              signal: controller.signal,
            }),
            apiRequest<Job[]>("/jobs/mine?limit=5", {
              signal: controller.signal,
            }),
          ]);
          if (!controller.signal.aborted) {
            setData({
              kind: "recruiter",
              dashboard: dashboardResult.data,
              jobs: jobsResult.data,
            });
          }
          return;
        }

        const dashboardResult = await apiRequest<AdminDashboard>(
          "/dashboard/admin",
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setData({ kind: "admin", dashboard: dashboardResult.data });
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(loadError));
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadHub();
    return () => controller.abort();
  }, [reloadKey, user.role]);

  if (isLoading) return <HubSkeleton />;

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/70 px-4 py-16 dark:bg-slate-950">
        <div
          role="alert"
          className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-lg dark:border-rose-900/50 dark:bg-slate-900"
        >
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600 dark:text-rose-400" />
          <h1 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
            We couldn&apos;t load your home feed
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error ?? "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (data.kind === "candidate") {
    return <CandidateHome user={user} data={data} />;
  }
  if (data.kind === "recruiter") {
    return <RecruiterHome user={user} data={data} />;
  }
  return <AdminHome user={user} dashboard={data.dashboard} />;
}

function HomeHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200/80 pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
      <div>
        <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
      <Link
        href={actionHref}
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-500"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </header>
  );
}

function CandidateHome({
  user,
  data,
}: {
  user: AuthUser;
  data: CandidateHubData;
}) {
  const { dashboard } = data;
  const byStatus = dashboard.applications.byStatus;
  const activeApplications =
    (byStatus.applied ?? 0) +
    (byStatus.under_review ?? 0) +
    (byStatus.shortlisted ?? 0);

  return (
    <div className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <HomeHeader
          eyebrow="Candidate home"
          title={`Welcome back, ${firstName(user)}`}
          description="Your live application activity and newly published opportunities, in one place."
          actionHref="/jobs"
          actionLabel="Browse jobs"
        />

        <section
          aria-label="Candidate overview"
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={FileText}
            label="Applications"
            value={dashboard.applications.total}
            detail="Total submitted"
          />
          <StatCard
            icon={Clock3}
            label="Active pipeline"
            value={activeApplications}
            detail="Applied, review, or shortlist"
          />
          <StatCard
            icon={UserRoundCheck}
            label="Profile strength"
            value={`${dashboard.profileCompletionPercent}%`}
            detail={
              dashboard.profileCompletionPercent === 100
                ? "Profile complete"
                : "Complete your profile"
            }
          />
          <StatCard
            icon={Bell}
            label="Unread updates"
            value={dashboard.unreadNotificationsCount}
            detail="Application notifications"
          />
        </section>

        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <SectionHeading
              title="Latest opportunities"
              href="/jobs"
              linkLabel="View all jobs"
            />
            {data.jobs.length > 0 ? (
              <div className="mt-5 space-y-3">
                {data.jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState message="No published jobs are available right now." />
            )}
          </section>

          <section>
            <SectionHeading
              title="Recent applications"
              href="/candidate/applications"
              linkLabel="Track all"
            />
            <RecentApplications
              applications={dashboard.recentApplications}
              candidateView
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function RecruiterHome({
  user,
  data,
}: {
  user: AuthUser;
  data: RecruiterHubData;
}) {
  const { dashboard } = data;
  const actionable =
    (dashboard.applications.byStatus.under_review ?? 0) +
    (dashboard.applications.byStatus.shortlisted ?? 0);

  return (
    <div className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <HomeHeader
          eyebrow="Recruiter home"
          title={`Welcome back, ${firstName(user)}`}
          description="Live hiring activity from your company workspace."
          actionHref="/recruiter/jobs/new"
          actionLabel="Post a job"
        />

        <section
          aria-label="Recruiter overview"
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={BriefcaseBusiness}
            label="Active jobs"
            value={dashboard.activeJobsCount}
            detail={`${formatIndianNumber(dashboard.totalJobsCount)} total jobs`}
          />
          <StatCard
            icon={Users}
            label="Applications"
            value={dashboard.applications.total}
            detail="Across your roles"
          />
          <StatCard
            icon={CheckCircle2}
            label="Actionable pipeline"
            value={actionable}
            detail="Review or shortlist"
          />
          <StatCard
            icon={BookmarkCheck}
            label="Saved candidates"
            value={dashboard.savedCandidatesCount}
            detail="In your talent pool"
          />
        </section>

        {!dashboard.hasCompany ? (
          <div className="mt-9 rounded-2xl border border-cyan-200 bg-cyan-50 p-7 dark:border-cyan-900/50 dark:bg-cyan-950/30">
            <Building2 className="h-7 w-7 text-cyan-700 dark:text-cyan-400" />
            <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
              Set up your company profile
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Create or join a company before publishing your first opportunity.
            </p>
            <Link
              href="/recruiter/profile"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
            >
              Open company profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <SectionHeading
                title="Your recent jobs"
                href="/recruiter/jobs"
                linkLabel="Manage all jobs"
              />
              {data.jobs.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {data.jobs.map((job) => (
                    <article
                      key={job._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <Link
                            href={`/recruiter/jobs/${job._id}/applications`}
                            className="font-bold text-slate-950 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-400"
                          >
                            {job.title}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatJobLabel(job.employmentType)} ·{" "}
                            {formatSalary(job)} ·{" "}
                            {formatIndianNumber(job.applicationCount)}{" "}
                            applications
                          </p>
                        </div>
                        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">
                          {job.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState message="You have not created any jobs yet." />
              )}
            </section>

            <section>
              <SectionHeading
                title="Recent applications"
                href="/recruiter/dashboard"
                linkLabel="Open pipeline"
              />
              <RecentApplications
                applications={dashboard.recentApplications}
                candidateView={false}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminHome({
  user,
  dashboard,
}: {
  user: AuthUser;
  dashboard: AdminDashboard;
}) {
  return (
    <div className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <HomeHeader
          eyebrow="Platform overview"
          title={`Welcome back, ${firstName(user)}`}
          description="Live totals from the Credify platform."
          actionHref="/jobs"
          actionLabel="Review public jobs"
        />
        <section
          aria-label="Platform overview"
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={Users}
            label="Users"
            value={dashboard.users.total}
            detail={`${formatIndianNumber(dashboard.users.candidates)} candidates · ${formatIndianNumber(dashboard.users.recruiters)} recruiters`}
          />
          <StatCard
            icon={Building2}
            label="Companies"
            value={dashboard.totalCompanies}
            detail="Registered companies"
          />
          <StatCard
            icon={BriefcaseBusiness}
            label="Jobs"
            value={dashboard.jobs.total}
            detail={`${formatIndianNumber(dashboard.jobs.byStatus.published ?? 0)} published`}
          />
          <StatCard
            icon={FileText}
            label="Applications"
            value={dashboard.totalApplications}
            detail="Platform-wide submissions"
          />
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        {typeof value === "number" ? formatIndianNumber(value) : value}
      </p>
      <h2 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
        {label}
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </article>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function RecentApplications({
  applications,
  candidateView,
}: {
  applications: RecentApplication[];
  candidateView: boolean;
}) {
  if (applications.length === 0)
    return <EmptyState message="No application activity yet." />;

  return (
    <div className="mt-5 space-y-3">
      {applications.map((application) => {
        const status = STATUS_DETAILS[application.status as ApplicationStatus];
        const href = candidateView
          ? `/jobs/${application.jobId}`
          : `/recruiter/jobs/${application.jobId}/applications`;
        return (
          <article
            key={application._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <Link
              href={href}
              className="text-sm font-bold text-slate-950 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-400"
            >
              {application.jobTitle ?? "Job no longer available"}
            </Link>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
              >
                {status.label}
              </span>
              <time
                className="text-xs text-slate-500 dark:text-slate-400"
                dateTime={application.createdAt}
              >
                {formatIndianDate(application.createdAt)}
              </time>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {message}
    </p>
  );
}

function HubSkeleton() {
  return (
    <div className="flex-1 bg-slate-50/70 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-9 w-72 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
