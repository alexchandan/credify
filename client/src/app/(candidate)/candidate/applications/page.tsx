"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { formatSalary } from "@/lib/jobData";
import { CandidateApplicationsSkeleton } from "@/components/ui/skeletons";
import type { Application, ApplicationStatus } from "@/types/application";

type StatusTab =
  "all" | "active" | "shortlisted" | "hired" | "rejected" | "withdrawn";

function statusBadge(status: ApplicationStatus) {
  switch (status) {
    case "applied":
      return {
        label: "Applied",
        classes:
          "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/30",
        dot: "bg-blue-500",
      };
    case "under_review":
      return {
        label: "Under Review",
        classes:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30",
        dot: "bg-amber-500",
      };
    case "shortlisted":
      return {
        label: "Shortlisted 🎉",
        classes:
          "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20 dark:bg-cyan-950/40 dark:text-cyan-300 dark:ring-cyan-500/30",
        dot: "bg-cyan-500",
      };
    case "hired":
      return {
        label: "Hired ✨",
        classes:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30",
        dot: "bg-emerald-500",
      };
    case "rejected":
      return {
        label: "Not Selected",
        classes:
          "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/30",
        dot: "bg-rose-500",
      };
    case "withdrawn":
      return {
        label: "Withdrawn",
        classes:
          "bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoverLetter, setSelectedCoverLetter] =
    useState<Application | null>(null);
  const [withdrawingApp, setWithdrawingApp] = useState<Application | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  // Real-time status update listener from SSE
  useEffect(() => {
    function handleStatusUpdate(e: Event) {
      const custom = e as CustomEvent<{
        applicationId: string;
        status: ApplicationStatus;
        jobId: string;
      }>;

      if (custom.detail?.applicationId && custom.detail?.status) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === custom.detail.applicationId
              ? { ...app, status: custom.detail.status }
              : app,
          ),
        );
        showToast(
          `Application status updated to "${custom.detail.status.replace("_", " ")}"!`,
        );
      }
    }

    window.addEventListener(
      "credify:application-status-updated",
      handleStatusUpdate,
    );
    return () => {
      window.removeEventListener(
        "credify:application-status-updated",
        handleStatusUpdate,
      );
    };
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  }

  async function loadApplications() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<Application[]>("/applications/me?limit=50");
      setApplications(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmWithdraw() {
    if (!withdrawingApp) return;
    setActionLoading(true);
    try {
      await apiRequest(`/applications/${withdrawingApp._id}/status`, {
        method: "PATCH",
        body: { status: "withdrawn" },
      });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === withdrawingApp._id
            ? { ...app, status: "withdrawn" }
            : app,
        ),
      );
      showToast("Application withdrawn.");
      setWithdrawingApp(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredApps = applications.filter((app) => {
    if (activeTab === "active") {
      if (
        app.status !== "applied" &&
        app.status !== "under_review" &&
        app.status !== "shortlisted"
      )
        return false;
    } else if (activeTab !== "all" && app.status !== activeTab) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = app.job?.title.toLowerCase().includes(q);
      const matchCompany = app.company?.name.toLowerCase().includes(q);
      return Boolean(matchTitle || matchCompany);
    }

    return true;
  });

  const counts = {
    all: applications.length,
    active: applications.filter(
      (a) =>
        a.status === "applied" ||
        a.status === "under_review" ||
        a.status === "shortlisted",
    ).length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    withdrawn: applications.filter((a) => a.status === "withdrawn").length,
  };

  if (isLoading && applications.length === 0) {
    return <CandidateApplicationsSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast */}
      {toastMsg && (
        <aside
          aria-label="Notification alert"
          className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-600 px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-cyan-950/20 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-start sm:text-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span className="leading-snug">{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Dismiss toast"
            className="ml-2 rounded-md p-1 text-cyan-200 hover:text-white sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </aside>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
            <FileText className="h-3.5 w-3.5" />
            Candidate Career Hub
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            My Job Applications
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track real-time status updates, review submitted credentials, and
            manage your pipeline.
          </p>
        </div>

        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 active:scale-[0.98]"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Browse More Jobs
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "active", label: "In Progress" },
              { key: "shortlisted", label: "Shortlisted" },
              { key: "hired", label: "Hired" },
              { key: "rejected", label: "Archived" },
              { key: "withdrawn", label: "Withdrawn" },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
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
                  {counts[tab.key] || 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role or company..."
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
            onClick={loadApplications}
            className="ml-auto underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Application List */}
      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-5 w-1/3 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-1/4 rounded-md bg-slate-100 dark:bg-slate-800/60" />
              <div className="mt-4 h-8 w-28 rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            {searchQuery || activeTab !== "all"
              ? "No applications match your filter"
              : "You haven't submitted any applications yet"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            {searchQuery || activeTab !== "all"
              ? "Try adjusting your search terms or filter selection."
              : "Explore verified opportunities on the Credify job board and apply directly with your profile."}
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-500"
          >
            Explore Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredApps.map((app) => {
            const badge = statusBadge(app.status);
            const isTerminal =
              app.status === "withdrawn" ||
              app.status === "rejected" ||
              app.status === "hired";

            return (
              <div
                key={app._id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                {/* Left side: Job & Company Details */}
                <div className="flex items-start gap-4">
                  {app.company?.logoUrl ? (
                    <Image
                      src={app.company.logoUrl}
                      alt={app.company.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                      <Building2 className="h-6 w-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/jobs/${app.jobId}`}
                        className="text-base font-bold text-slate-900 transition hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400"
                      >
                        {app.job?.title || "Job Posting"}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                        />
                        {badge.label}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {app.company?.name || "Company"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {app.job?.location && app.job.location.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {app.job.isRemote ? "Remote" : app.job.location[0]}
                        </span>
                      )}
                      {app.job?.salaryRange && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <Wallet className="h-3 w-3 text-slate-400" />
                          {formatSalary(app.job.salaryRange)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        Applied on{" "}
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-4 sm:mt-0 sm:border-t-0 sm:pt-0">
                  {/* View Submitted Cover Letter */}
                  {app.coverLetter && (
                    <button
                      type="button"
                      onClick={() => setSelectedCoverLetter(app)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <FileText className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                      Cover Letter
                    </button>
                  )}

                  {/* View Snapshot Resume */}
                  <a
                    href={app.resumeSnapshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    Resume
                  </a>

                  {/* Withdraw Button */}
                  {!isTerminal && (
                    <button
                      type="button"
                      onClick={() => setWithdrawingApp(app)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cover Letter Modal */}
      {selectedCoverLetter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cover Letter Submitted
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoverLetter(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <p className="whitespace-pre-wrap">
                {selectedCoverLetter.coverLetter}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCoverLetter(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawingApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <XCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Withdraw Application?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to withdraw your application for{" "}
              <strong className="text-slate-900 dark:text-white">
                {withdrawingApp.job?.title || "this job"}
              </strong>
              ? You will not be able to re-apply for this specific opening once
              withdrawn.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setWithdrawingApp(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmWithdraw}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {actionLoading && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
