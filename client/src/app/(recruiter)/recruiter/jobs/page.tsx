"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
  X,
  XCircle,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { formatSalary } from "@/lib/jobData";
import { RecruiterJobsSkeleton } from "@/components/ui/skeletons";
import type { Job } from "@/types/job";

type StatusFilter = "all" | "published" | "draft" | "closed";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const searchInputId = useId();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<Job[]>("/jobs/mine?limit=50");
      setJobs(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  }

  async function handlePublish(jobId: string) {
    setActionLoadingId(jobId);
    try {
      await apiRequest(`/jobs/${jobId}/publish`, { method: "PATCH" });
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: "published" } : j)),
      );
      showToast("Job has been successfully published!");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleClose(jobId: string) {
    setActionLoadingId(jobId);
    try {
      await apiRequest(`/jobs/${jobId}/close`, { method: "PATCH" });
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: "closed" } : j)),
      );
      showToast("Job posting has been closed to new applications.");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function confirmDelete() {
    if (!deletingJob) return;
    setActionLoadingId(deletingJob._id);
    try {
      await apiRequest(`/jobs/${deletingJob._id}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j._id !== deletingJob._id));
      showToast("Job posting deleted.");
      setDeletingJob(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter !== "all" && job.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchSkill = job.skillsRequired.some((s) =>
        s.toLowerCase().includes(q),
      );
      const matchLoc = job.location.some((l) => l.toLowerCase().includes(q));
      return matchTitle || matchSkill || matchLoc;
    }
    return true;
  });

  const counts = {
    all: jobs.length,
    published: jobs.filter((j) => j.status === "published").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  if (isLoading && jobs.length === 0) {
    return <RecruiterJobsSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {successToast && (
        <aside
          aria-label="Notification alert"
          className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-emerald-950/20 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-start sm:text-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span className="leading-snug">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            aria-label="Dismiss alert"
            className="ml-2 rounded-md p-1 text-emerald-200 hover:text-white sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </aside>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Recruiter Workspace
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Job Postings & Pipelines
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your company listings, review applicants, and control hiring
            status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/25 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Post a New Job
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "all", label: "All Jobs" },
              { key: "published", label: "Published" },
              { key: "draft", label: "Drafts" },
              { key: "closed", label: "Closed" },
            ] as const
          ).map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
                <span
                  className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                    isSelected
                      ? "bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor={searchInputId} className="sr-only">
            Filter by title, skill, or location
          </label>
          <input
            id={searchInputId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, skill, location..."
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-9 text-xs text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/30"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
          <button
            type="button"
            onClick={loadJobs}
            className="ml-auto underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-5 w-2/3 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-4 w-1/3 rounded-md bg-slate-100 dark:bg-slate-800/60" />
              <div className="mt-6 flex gap-2">
                <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="mt-6 h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800/80" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            {searchQuery || activeFilter !== "all"
              ? "No matching jobs found"
              : "No job postings yet"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            {searchQuery || activeFilter !== "all"
              ? "Try adjusting your search criteria or filter options."
              : "Create your first job listing to start attracting and reviewing top verified candidates."}
          </p>
          <Link
            href="/recruiter/jobs/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const isProcessing = actionLoadingId === job._id;
            return (
              <div
                key={job._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  {/* Top Bar: Status and Actions */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        job.status === "published"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30"
                          : job.status === "draft"
                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30"
                            : "bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          job.status === "published"
                            ? "bg-emerald-500"
                            : job.status === "draft"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                        }`}
                      />
                      {job.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/jobs/${job._id}`}
                        target="_blank"
                        title="View public posting"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/recruiter/jobs/${job._id}/edit`}
                        title="Edit job details"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingJob(job)}
                        title="Delete job"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 line-clamp-1 text-base font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>

                  {/* Meta Details */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 capitalize">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                      {job.employmentType.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 capitalize">
                      {job.experienceLevel} level
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.isRemote
                        ? "Remote"
                        : job.location[0] || "Undisclosed"}
                    </span>
                  </div>

                  {/* Salary if present */}
                  {job.salaryRange && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <Wallet className="h-3.5 w-3.5 text-slate-400" />
                      {formatSalary(job.salaryRange)}
                    </div>
                  )}

                  {/* Skills tags */}
                  {job.skillsRequired.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {job.skillsRequired.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                          +{job.skillsRequired.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    {/* Applicant Count CTA */}
                    <Link
                      href={`/recruiter/jobs/${job._id}/applications`}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-900/60"
                    >
                      <Users className="h-4 w-4" />
                      {job.applicationCount === 1
                        ? "1 Applicant"
                        : `${job.applicationCount} Applicants`}
                    </Link>

                    {/* Publish / Close status button */}
                    {job.status === "draft" && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handlePublish(job._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Publish
                      </button>
                    )}

                    {job.status === "published" && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleClose(job._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {isProcessing ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        Close
                      </button>
                    )}

                    {job.status === "closed" && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handlePublish(job._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {isProcessing ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Delete Job Posting?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 dark:text-white">
                {deletingJob.title}
              </strong>
              ? This will permanently remove the listing. Any candidates who
              applied will retain their history.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionLoadingId === deletingJob._id}
                onClick={() => setDeletingJob(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === deletingJob._id}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {actionLoadingId === deletingJob._id && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Delete Posting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
