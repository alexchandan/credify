"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, ApiError } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import JobDetailSkeleton from "@/components/ui/skeletons/JobDetailSkeleton";
import { formatJobLabel, formatSalary } from "@/lib/jobData";
import type { CompanySummary, Job } from "@/types/job";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<CompanySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [needsResume, setNeedsResume] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const jobResult = await apiRequest<Job>(`/jobs/${id}`, {
          skipAuth: true,
          signal: controller.signal,
        });
        const companyResult = await apiRequest<CompanySummary>(
          `/companies/${jobResult.data.companyId}`,
          { skipAuth: true, signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setJob(jobResult.data);
        setCompany(companyResult.data);
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  async function apply() {
    if (!job) return;
    setIsApplying(true);
    setApplicationError(null);
    setNeedsResume(false);
    try {
      await apiRequest("/applications", {
        method: "POST",
        body: {
          jobId: job._id,
          ...(coverLetter.trim() ? { coverLetter: coverLetter.trim() } : {}),
        },
      });
      setHasApplied(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "CANDIDATE_RESUME_REQUIRED") {
        setNeedsResume(true);
      }
      setApplicationError(getErrorMessage(err));
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Job unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {error ?? "This job could not be found."}
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>
      </div>
    );
  }

  const location = job.isRemote
    ? "Remote"
    : job.location.join(", ") || "Location not specified";

  return (
    <div className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-700 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  {company?.name ?? "Company unavailable"}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
                  {job.title}
                </h1>
                {company?.industry && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {company.industry}
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-7 grid gap-3 border-y border-slate-100 py-5 text-sm text-slate-600 sm:grid-cols-2 dark:border-slate-800 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin
                  className="h-4 w-4 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <dt className="sr-only">Location</dt>
                <dd>{location}</dd>
              </div>
              <div className="flex items-center gap-2">
                <BriefcaseBusiness
                  className="h-4 w-4 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <dt className="sr-only">Employment type</dt>
                <dd>{formatJobLabel(job.employmentType)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock3
                  className="h-4 w-4 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <dt className="sr-only">Experience level</dt>
                <dd>{formatJobLabel(job.experienceLevel)} level</dd>
              </div>
              <div className="flex items-center gap-2">
                <Wallet
                  className="h-4 w-4 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <dt className="sr-only">Salary</dt>
                <dd>{formatSalary(job)}</dd>
              </div>
            </dl>

            <section className="mt-7">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                About the role
              </h2>
              <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                {job.description}
              </p>
            </section>

            <section className="mt-7">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Skills
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-24 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Apply for this role
            </h2>

            {job.status !== "published" ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                This role is no longer accepting applications.
              </p>
            ) : hasApplied ? (
              <div
                role="status"
                className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <CheckCircle2 className="mb-2 h-5 w-5" aria-hidden="true" />
                Your application was submitted successfully.
              </div>
            ) : isAuthLoading ? (
              <div className="mt-4 h-11 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : !user ? (
              <>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Sign in with a candidate account to submit your application.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/jobs/${job._id}`)}`}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Sign in to apply
                </Link>
              </>
            ) : user.role !== "candidate" ? (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Applications can only be submitted from a candidate account.
              </p>
            ) : (
              <>
                <label
                  htmlFor="cover-letter"
                  className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Cover letter{" "}
                  <span className="text-slate-400 dark:text-slate-500">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  maxLength={3000}
                  rows={6}
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:focus:ring-orange-900/50"
                />
                {applicationError && (
                  <div
                    role="alert"
                    className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {applicationError}
                    {needsResume && (
                      <Link
                        href="/candidate/profile"
                        className="mt-2 block font-semibold underline"
                      >
                        Upload your resume
                      </Link>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={apply}
                  disabled={isApplying}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApplying ? "Submitting..." : "Submit application"}
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
