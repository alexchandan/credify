"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileUser,
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

function date(value: string) {
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
    load();
    return () => controller.abort();
  }, [reloadToken]);

  if (loading) {
    return (
      <main className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-80 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-28 rounded-lg bg-white dark:bg-slate-950"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }
  if (error || !dashboard) {
    return (
      <main className="flex-1 bg-slate-50 px-4 py-16 sm:px-6 dark:bg-slate-900">
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error ?? "Unable to load your dashboard."}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadToken((value) => value + 1);
            }}
            className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const firstName = user?.fullName?.split(/\s+/)[0] ?? "there";
  return (
    <main className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
            Recruiter workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {company
              ? `Managing ${company.name}`
              : "Build your hiring workspace to get started."}
          </p>
        </header>

        {!dashboard.hasCompany ? (
          <section className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-900 dark:bg-orange-950/30">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Create your company to start posting jobs
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Add your company details before publishing your first role.
            </p>
            <Link
              href="/recruiter/profile#company"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Create company <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                icon={BriefcaseBusiness}
                label="Active jobs"
                value={dashboard.activeJobsCount}
              />
              <Stat
                icon={ClipboardList}
                label="Total jobs"
                value={dashboard.totalJobsCount}
              />
              <Stat
                icon={Users}
                label="Applications"
                value={dashboard.applications.total}
              />
              <Stat
                icon={FileUser}
                label="Saved candidates"
                value={dashboard.savedCandidatesCount}
              />
            </div>
            <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  Application pipeline
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 lg:grid-cols-6 dark:bg-slate-800">
                {APPLICATION_STATUSES.map((status) => (
                  <div
                    key={status}
                    className="bg-white px-4 py-4 dark:bg-slate-950"
                  >
                    <p className="text-xl font-bold text-slate-950 dark:text-white">
                      {dashboard.applications.byStatus[status] ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {STATUS_DETAILS[status].label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Applications applications={dashboard.recentApplications} />
              <RecentJobs jobs={jobs} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      <p className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function Applications({
  applications,
}: {
  applications: RecruiterDashboard["recentApplications"];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Recent applications
        </h2>
      </div>
      {applications.length ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {applications.map((application) => {
            const status = STATUS_DETAILS[application.status];
            const Icon = status.icon;
            return (
              <div
                key={application._id}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {application.jobTitle ?? "Role unavailable"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {date(application.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${status.className}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No applications yet.
        </p>
      )}
    </section>
  );
}

function RecentJobs({ jobs }: { jobs: Job[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Recent jobs
        </h2>
        <Link
          href="/jobs"
          className="text-xs font-semibold text-orange-700 dark:text-orange-400"
        >
          Browse jobs
        </Link>
      </div>
      {jobs.length ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {jobs.map((job) => (
            <Link
              key={job._id}
              href={`/jobs/${job._id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <BriefcaseBusiness className="h-5 w-5 shrink-0 text-orange-600" />
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {job.title}
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No jobs posted yet.
        </p>
      )}
    </section>
  );
}
