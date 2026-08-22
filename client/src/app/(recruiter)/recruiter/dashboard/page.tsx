"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileUser,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { useAuth } from "@/context/AuthContext";
import {
  APPLICATION_STATUSES,
  STATUS_DETAILS,
} from "@/components/applications/statusMeta";
import type { RecruiterDashboard } from "@/types/dashboard";
import type { Job } from "@/types/job";
import type { Company, RecruiterProfile } from "@/types/recruiter";
import RecruiterDashboardSkeleton from "@/components/ui/skeletons/RecruiterDashboardSkeleton";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [dashboardResult, jobsResult, profileResult] = await Promise.all([
          apiRequest<RecruiterDashboard>("/dashboard/recruiter", {
            signal: controller.signal,
          }),
          apiRequest<Job[]>("/jobs/mine?limit=5", {
            signal: controller.signal,
          }),
          apiRequest<RecruiterProfile>("/recruiters/me", {
            signal: controller.signal,
          }),
        ]);
        if (controller.signal.aborted) return;
        setDashboard(dashboardResult.data);
        setJobs(jobsResult.data);
        if (profileResult.data.companyId) {
          const companyResult = await apiRequest<Company>(
            `/companies/${profileResult.data.companyId}`,
            { signal: controller.signal },
          );
          if (!controller.signal.aborted) setCompany(companyResult.data);
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [reloadToken]);

  if (loading) return <RecruiterDashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <main className="flex-1 bg-slate-50 px-4 py-16 sm:px-6 dark:bg-slate-900">
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-slate-950"
        >
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            We couldn&apos;t load your dashboard
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error ?? "Please try again in a moment."}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadToken((value) => value + 1);
            }}
            className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const firstName = user?.fullName?.split(/\s+/)[0] ?? "there";
  return (
    <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60">
                <Sparkles className="h-4 w-4" />
              </span>
              Recruiter workspace
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {company
                ? `Here's what's happening at ${company.name}.`
                : "Set up your company and start building your team."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/recruiter/profile"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
            >
              <FileUser className="h-4 w-4" /> My profile
            </Link>
            <Link
              href="/jobs"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" /> Browse jobs
            </Link>
          </div>
        </header>

        {!dashboard.hasCompany ? (
          <CompanyPrompt />
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                icon={BriefcaseBusiness}
                label="Active jobs"
                value={dashboard.activeJobsCount}
                accent="orange"
              />
              <Stat
                icon={ClipboardList}
                label="Total jobs"
                value={dashboard.totalJobsCount}
                accent="blue"
              />
              <Stat
                icon={Users}
                label="Total applications"
                value={dashboard.applications.total}
                accent="violet"
              />
              <Stat
                icon={FileUser}
                label="Saved candidates"
                value={dashboard.savedCandidatesCount}
                accent="emerald"
              />
            </div>
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6 dark:border-slate-800">
                <div>
                  <h2 className="font-semibold text-slate-950 dark:text-white">
                    Application pipeline
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    A quick view of where candidates are in your process.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {dashboard.applications.total} total
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 lg:grid-cols-6 dark:bg-slate-800">
                {APPLICATION_STATUSES.map((status) => (
                  <div
                    key={status}
                    className="bg-white px-5 py-4 dark:bg-slate-950"
                  >
                    <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {dashboard.applications.byStatus[status] ?? 0}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {STATUS_DETAILS[status].label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Applications applications={dashboard.recentApplications} />
              <RecentJobs jobs={jobs} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function CompanyPrompt() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-10 dark:bg-slate-800">
      <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-200">
          <BuildingIcon /> One step to get started
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Create your company profile
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
          Add your company details to unlock job posting and give candidates a
          trusted view of your team.
        </p>
        <Link
          href="/recruiter/profile#company"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Set up company <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function BuildingIcon() {
  return <BriefcaseBusiness className="h-3.5 w-3.5" />;
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: number;
  accent: "orange" | "blue" | "violet" | "emerald";
}) {
  const accents = {
    orange:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    violet:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function Applications({
  applications,
}: {
  applications: RecruiterDashboard["recentApplications"];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <PanelHeader
        title="Recent applications"
        subtitle="The latest candidates in your pipeline"
        href="/jobs"
      />
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {applications.length ? (
          applications.map((application) => {
            const status = STATUS_DETAILS[application.status];
            const Icon = status.icon;
            return (
              <div
                key={application._id}
                className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6 dark:hover:bg-slate-900"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {application.jobTitle ?? "Role unavailable"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(application.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${status.className}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Users}
            title="No applications yet"
            text="Applications will appear here when candidates apply."
          />
        )}
      </div>
    </section>
  );
}

function RecentJobs({ jobs }: { jobs: Job[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <PanelHeader
        title="Your recent jobs"
        subtitle="Keep an eye on your open roles"
        href="/jobs"
      />
      {jobs.length ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {jobs.map((job) => (
            <Link
              key={job._id}
              href={`/jobs/${job._id}`}
              className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6 dark:hover:bg-slate-900"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <BriefcaseBusiness className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {job.title}
                </span>
                <span className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="capitalize">{job.status}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {job.applicationCount} applicants
                  </span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No jobs posted yet"
          text="Your published and draft roles will show up here."
        />
      )}
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-slate-800">
      <div>
        <h2 className="font-semibold text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400"
      >
        View all <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BriefcaseBusiness;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}
