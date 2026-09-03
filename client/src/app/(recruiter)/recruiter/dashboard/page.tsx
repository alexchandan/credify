"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileUser,
  Plus,
  RefreshCw,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { useAuth } from "@/context/AuthContext";
import {
  APPLICATION_STATUSES,
  STATUS_DETAILS,
} from "@/components/applications/statusMeta";
import type { ApplicationStatus, RecruiterDashboard } from "@/types/dashboard";
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

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    ApplicationStatus | "all"
  >("all");
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
        setProfile(profileResult.data);

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

  const firstName = user?.fullName?.split(/\s+/)[0] || "there";

  const filteredApplications = useMemo(() => {
    if (!dashboard?.recentApplications) return [];
    if (selectedStatusFilter === "all") return dashboard.recentApplications;
    return dashboard.recentApplications.filter(
      (app) => app.status === selectedStatusFilter,
    );
  }, [dashboard, selectedStatusFilter]);

  if (loading) return <RecruiterDashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50/80 px-4 py-16 sm:px-6 dark:bg-slate-950">
        <div
          role="alert"
          className="mx-auto w-full max-w-lg rounded-2xl border border-red-200/90 bg-white p-7 text-center shadow-xl shadow-red-500/5 dark:border-red-900/40 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            We couldn&apos;t load your recruiter dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error ?? "Something went wrong while retrieving your workspace."}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadToken((value) => value + 1);
            }}
            className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white shadow-sm shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 active:scale-[0.99]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  const inReviewCount = dashboard.applications.byStatus.under_review ?? 0;
  const shortlistedCount = dashboard.applications.byStatus.shortlisted ?? 0;
  const hiredCount = dashboard.applications.byStatus.hired ?? 0;
  const inPipelineActionable = inReviewCount + shortlistedCount;

  return (
    <main className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Workspace Top Header */}
        <header className="relative flex flex-col justify-between gap-6 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-50/80 px-3 py-1 text-xs font-semibold text-cyan-700 backdrop-blur-xs dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                Recruiter Workspace
              </span>
              {company && (
                <Link
                  href="/recruiter/profile#company"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-400"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>{company.name}</span>
                  {profile?.companyRole && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-400">
                      {profile.companyRole}
                    </span>
                  )}
                </Link>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              {getGreeting(firstName)}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {company
                ? `Manage your active roles, track applicants, and engage verified talent for ${company.name}.`
                : "Set up your company profile to start publishing jobs and building your team."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/recruiter/profile"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-slate-950 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white"
            >
              <FileUser className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Recruiter Profile
            </Link>
            <Link
              href="/jobs"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              Browse Job Board
            </Link>
          </div>
        </header>

        {!dashboard.hasCompany ? (
          <CompanyPrompt />
        ) : (
          <>
            {/* Primary Stat Cards */}
            <section
              aria-label="Workspace overview stats"
              className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StatCard
                icon={BriefcaseBusiness}
                label="Active Jobs"
                value={dashboard.activeJobsCount}
                detail={`${dashboard.totalJobsCount} total postings`}
                tone="cyan"
              />
              <StatCard
                icon={Users}
                label="Total Applications"
                value={dashboard.applications.total}
                detail="Across all positions"
                tone="indigo"
              />
              <StatCard
                icon={UserCheck}
                label="Actionable Pipeline"
                value={inPipelineActionable}
                detail={`${inReviewCount} review · ${shortlistedCount} shortlist · ${hiredCount} hired`}
                tone="emerald"
              />
              <StatCard
                icon={BookmarkCheck}
                label="Saved Candidates"
                value={dashboard.savedCandidatesCount}
                detail="In your talent pool"
                tone="amber"
              />
            </section>

            {/* Application Pipeline Stage Funnel */}
            <section
              aria-label="Application pipeline stages"
              className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-950 dark:text-white">
                      Hiring Pipeline Stages
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {dashboard.applications.total} total
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Distribution of candidates across each hiring milestone.
                    Click a stage to filter recent applicants.
                  </p>
                </div>

                {selectedStatusFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("all")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                  >
                    Reset stage filter
                  </button>
                )}
              </div>

              {/* Progress Visual Bar */}
              {dashboard.applications.total > 0 && (
                <div className="mt-5">
                  <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
                    {APPLICATION_STATUSES.map((status) => {
                      const count =
                        dashboard.applications.byStatus[status] ?? 0;
                      if (count === 0) return null;
                      const percent =
                        (count / dashboard.applications.total) * 100;
                      const barColors: Record<ApplicationStatus, string> = {
                        applied: "bg-blue-500",
                        under_review: "bg-amber-500",
                        shortlisted: "bg-cyan-500",
                        hired: "bg-emerald-500",
                        rejected: "bg-rose-400",
                        withdrawn: "bg-slate-400",
                      };
                      return (
                        <div
                          key={status}
                          style={{ width: `${percent}%` }}
                          title={`${STATUS_DETAILS[status].label}: ${count} (${Math.round(percent)}%)`}
                          className={`h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full ${barColors[status]}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Grid Cards */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {APPLICATION_STATUSES.map((status) => {
                  const count = dashboard.applications.byStatus[status] ?? 0;
                  const meta = STATUS_DETAILS[status];
                  const Icon = meta.icon;
                  const isSelected = selectedStatusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setSelectedStatusFilter((current) =>
                          current === status ? "all" : status,
                        )
                      }
                      className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-50/50 shadow-xs ring-2 ring-cyan-500/20 dark:border-cyan-500 dark:bg-cyan-950/40"
                          : "border-slate-200/80 bg-slate-50/60 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:shadow-xs dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-105 ${meta.className}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {isSelected && (
                          <span className="flex h-2 w-2 rounded-full bg-cyan-500" />
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                          {count}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-500 transition-colors duration-150 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200">
                          {meta.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Split Content: Recent Applications & Jobs + Company Overview */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Left Column: Recent Applications */}
              <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                  <div>
                    <h2 className="font-semibold text-slate-950 dark:text-white">
                      Recent Applications
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {selectedStatusFilter === "all"
                        ? "Latest candidate submissions in your pipeline"
                        : `Showing filtered: ${STATUS_DETAILS[selectedStatusFilter].label}`}
                    </p>
                  </div>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 transition hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    View active roles
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((application) => {
                      const statusMeta = STATUS_DETAILS[application.status];
                      const StatusIcon = statusMeta.icon;

                      return (
                        <div
                          key={application._id}
                          className="flex flex-col gap-3 px-6 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40"
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <Users className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/jobs/${application.jobId}`}
                                className="block truncate text-sm font-semibold text-slate-900 transition hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-400"
                              >
                                {application.jobTitle ??
                                  "Role title unavailable"}
                              </Link>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                  {timeAgo(application.createdAt)}
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                  {formatDate(application.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusMeta.label}
                            </span>
                            <Link
                              href={`/jobs/${application.jobId}`}
                              aria-label={`View role ${application.jobTitle ?? ""}`}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStatusFilter === "all"
                          ? "No applications received yet"
                          : `No candidates currently in ${STATUS_DETAILS[selectedStatusFilter].label}`}
                      </p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {selectedStatusFilter === "all"
                          ? "When job seekers apply to your openings, their profile and credentials will appear here."
                          : "Try clearing your status filter to see all recent applications."}
                      </p>
                      {selectedStatusFilter !== "all" && (
                        <button
                          type="button"
                          onClick={() => setSelectedStatusFilter("all")}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-600 dark:hover:bg-slate-800/80"
                        >
                          Clear stage filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Right Column: Recent Jobs & Company Snapshot */}
              <div className="space-y-6">
                {/* Company Snapshot Card */}
                {company && (
                  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:ring-cyan-900">
                            <Building2 className="h-6 w-6" />
                          </span>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-950 dark:text-white">
                            {company.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {company.industry || "Organization"} ·{" "}
                            {company.size || "1-10"} employees
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/recruiter/profile#company"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Edit company profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>

                    {company.websiteUrl && (
                      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <a
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:underline dark:text-cyan-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {company.websiteUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </section>
                )}

                {/* Recent Jobs Panel */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div>
                      <h2 className="font-semibold text-slate-950 dark:text-white">
                        Your Job Postings
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Recent openings published by your team
                      </p>
                    </div>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 transition hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                      All roles
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {jobs.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {jobs.map((job) => {
                        const isPublished = job.status === "published";
                        return (
                          <Link
                            key={job._id}
                            href={`/jobs/${job._id}`}
                            className="group flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400">
                                {job.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    isPublished
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isPublished
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  <span className="capitalize">
                                    {job.status}
                                  </span>
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-slate-400" />
                                  {job.applicationCount ?? 0} applicants
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No jobs published yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Your published postings will be listed here.
                      </p>
                    </div>
                  )}
                </section>

                {/* Quick Recruiter Tips & Next Steps */}
                <div className="rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50/80 to-slate-50/50 p-5 dark:border-cyan-950/60 dark:from-cyan-950/20 dark:to-slate-900/40">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-xs">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Hiring on Credify
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        Candidate credentials and experience badges are verified
                        for accuracy, ensuring high signal throughout your
                        pipeline.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
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
  value: number;
  detail: string;
  tone: "cyan" | "indigo" | "emerald" | "amber";
}) {
  const tones = {
    cyan: {
      bg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
      accent: "text-cyan-600 dark:text-cyan-400",
    },
    indigo: {
      bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    emerald: {
      bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      accent: "text-amber-600 dark:text-amber-400",
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone].bg}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  );
}

function CompanyPrompt() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-950 to-cyan-950 p-7 text-white shadow-2xl sm:p-10">
      <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" /> Getting started with hiring
        </span>

        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Complete your company profile
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Add your company details and logo to unlock verified job postings and
          build credibility with top candidates.
        </p>

        {/* 3 Step Roadmap */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">
              1
            </span>
            <h3 className="mt-3 text-sm font-semibold text-white">
              Company Details
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Name, website, industry, and branding logo.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">
              2
            </span>
            <h3 className="mt-3 text-sm font-semibold text-white">
              Post Open Roles
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Publish job requisitions to the Credify talent board.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">
              3
            </span>
            <h3 className="mt-3 text-sm font-semibold text-white">
              Review & Hire
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Evaluate verified applicant profiles and credentials.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/recruiter/profile#company"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-cyan-600 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.99]"
          >
            Set up company profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Preview Job Board
          </Link>
        </div>
      </div>
    </section>
  );
}
