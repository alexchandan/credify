"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { addCompanyNames } from "@/lib/jobData";
import type { Job, JobWithCompany } from "@/types/job";

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<Job[]>("/jobs?limit=3", {
      skipAuth: true,
      signal: controller.signal,
    })
      .then((result) => addCompanyNames(result.data, controller.signal))
      .then((enriched) => {
        if (!controller.signal.aborted) setJobs(enriched);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setJobs([]);
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [loadVersion]);

  return (
    <section className="bg-white px-5 py-14 sm:px-6 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Recently published
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              Featured jobs
            </h2>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Browse all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-7 rounded-lg border border-red-200 bg-red-50 px-5 py-6 dark:border-red-800 dark:bg-red-950/40">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setLoadVersion((version) => version + 1);
              }}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:underline dark:text-red-300"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 px-5 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No published jobs are available right now.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
