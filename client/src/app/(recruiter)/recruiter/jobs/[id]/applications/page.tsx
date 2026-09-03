"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { JobApplicationsPipelineSkeleton } from "@/components/ui/skeletons";
import type { Job } from "@/types/job";
import type { Application, ApplicationStatus } from "@/types/application";

const PIPELINE_STAGES: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "all", label: "All Applicants" },
  { key: "applied", label: "Applied" },
  { key: "under_review", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
];

function statusColor(status: ApplicationStatus) {
  switch (status) {
    case "applied":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/30";
    case "under_review":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30";
    case "shortlisted":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20 dark:bg-cyan-950/40 dark:text-cyan-300 dark:ring-cyan-500/30";
    case "hired":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/30";
    case "withdrawn":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function JobApplicationsPipelinePage() {
  const { id: jobId } = useParams<{ id: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [viewingCoverLetter, setViewingCoverLetter] =
    useState<Application | null>(null);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  }

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [jobRes, appsRes] = await Promise.all([
          apiRequest<Job>(`/jobs/${jobId}`),
          apiRequest<Application[]>(`/applications/job/${jobId}?limit=50`),
        ]);
        setJob(jobRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadData();
    }
  }, [jobId]);

  // Real-time listener for incoming applications
  useEffect(() => {
    function handleIncomingApp(e: Event) {
      const custom = e as CustomEvent<{ jobId: string; applicationId: string }>;
      if (custom.detail?.jobId === jobId) {
        // Refresh applicant list
        apiRequest<Application[]>(`/applications/job/${jobId}?limit=50`)
          .then((res) => {
            setApplications(res.data);
            showToast("A new candidate just applied for this position!");
          })
          .catch(() => undefined);
      }
    }

    window.addEventListener("credify:application-received", handleIncomingApp);
    return () => {
      window.removeEventListener(
        "credify:application-received",
        handleIncomingApp,
      );
    };
  }, [jobId]);

  async function updateStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
  ) {
    setUpdatingAppId(applicationId);
    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app,
        ),
      );

      const formatted = newStatus.replace("_", " ");
      showToast(`Candidate status updated to "${formatted}".`);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingAppId(null);
    }
  }

  const filteredApps = applications.filter((app) => {
    if (activeStage === "all") return true;
    return app.status === activeStage;
  });

  const counts: Record<string, number> = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    under_review: applications.filter((a) => a.status === "under_review")
      .length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    withdrawn: applications.filter((a) => a.status === "withdrawn").length,
  };

  if (isLoading && !job) {
    return <JobApplicationsPipelineSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Real-time Toast */}
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
            aria-label="Dismiss alert"
            className="ml-2 rounded-md p-1 text-cyan-200 hover:text-white sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </aside>
      )}

      {/* Breadcrumb navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>
        {job && (
          <Link
            href={`/jobs/${job._id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
          >
            View live job post
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
              <Users className="h-3.5 w-3.5" />
              Candidate Review Pipeline
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {job ? job.title : "Candidate Applications"}
            </h1>
            {job && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {job.employmentType.replace("_", " ")} &bull;{" "}
                {job.experienceLevel} &bull;{" "}
                {job.isRemote ? "Remote" : job.location.join(", ") || "On-site"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-center">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">
                {applications.length}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Total Applicants
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="block text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {counts.shortlisted || 0}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Shortlisted
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          {PIPELINE_STAGES.map((stage) => {
            const isSelected = activeStage === stage.key;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setActiveStage(stage.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {stage.label}
                <span
                  className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                    isSelected
                      ? "bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {counts[stage.key] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="mt-8 flex flex-col items-center justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
            <p className="mt-3 text-sm text-slate-500">
              Loading candidate applications...
            </p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              {activeStage === "all"
                ? "No applications received yet"
                : `No applicants in "${activeStage.replace("_", " ")}" status`}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {activeStage === "all"
                ? "When candidates apply for this job, their resumes and credentials will appear here in real time."
                : "Candidates moved to this status stage will show up here."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredApps.map((app) => {
              const candidate = app.candidate;
              const isUpdating = updatingAppId === app._id;
              const candidateName = candidate?.fullName || "Candidate";
              const initial = candidateName[0]?.toUpperCase() || "C";

              return (
                <div
                  key={app._id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                >
                  {/* Candidate Identity */}
                  <div className="flex items-start gap-4">
                    {candidate?.avatarUrl ? (
                      <Image
                        src={candidate.avatarUrl}
                        alt={candidateName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-600 to-cyan-700 text-base font-bold text-white shadow-sm">
                        {initial}
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {candidateName}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor(
                            app.status,
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {app.status.replace("_", " ")}
                        </span>
                      </div>

                      {candidate?.headline && (
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                          {candidate.headline}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {candidate?.email && <span>{candidate.email}</span>}
                        {candidate?.location &&
                          candidate.location.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {candidate.location[0]}
                            </span>
                          )}
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          Applied{" "}
                          {new Date(app.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Candidate Skills */}
                      {candidate?.skills && candidate.skills.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {candidate.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Changers */}
                  <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-4 sm:mt-0 sm:border-t-0 sm:pt-0">
                    {/* Cover Letter Viewer */}
                    {app.coverLetter && (
                      <button
                        type="button"
                        onClick={() => setViewingCoverLetter(app)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <FileText className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                        Cover Letter
                      </button>
                    )}

                    {/* Resume Snapshot Link */}
                    <a
                      href={app.resumeSnapshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      View Resume
                    </a>

                    {/* Status Dropdown / Action Buttons */}
                    {app.status !== "withdrawn" && (
                      <div className="relative inline-flex items-center">
                        <select
                          disabled={isUpdating}
                          value={app.status}
                          onChange={(e) =>
                            updateStatus(
                              app._id,
                              e.target.value as ApplicationStatus,
                            )
                          }
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {isUpdating && (
                          <LoaderCircle className="absolute right-2 h-3.5 w-3.5 animate-spin text-cyan-600" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cover Letter Modal */}
      {viewingCoverLetter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cover Letter &bull;{" "}
                  {viewingCoverLetter.candidate?.fullName || "Candidate"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingCoverLetter(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <p className="whitespace-pre-wrap">
                {viewingCoverLetter.coverLetter}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingCoverLetter(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
