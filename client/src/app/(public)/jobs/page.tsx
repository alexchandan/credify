"use client";

import { Suspense, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { JobCard } from "@/components/jobs/JobCard";
import { apiRequest } from "@/lib/apiClient";
import { addCompanyNames } from "@/lib/jobData";
import { getErrorMessage } from "@/lib/formErrors";
import JobBoardSkeleton, {
  JobGridSkeleton,
} from "@/components/ui/skeletons/JobBoardSkeleton";
import type { Job, JobWithCompany } from "@/types/job";

interface PaginationMeta {
  page: number;
  totalCount: number;
  totalPages: number;
}

function JobsFallback() {
  return <JobBoardSkeleton />;
}

function JobBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    totalCount: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams(queryString);
      params.set("limit", "9");
      try {
        const result = await apiRequest<Job[]>(`/jobs?${params}`, {
          skipAuth: true,
          signal: controller.signal,
        });
        const enriched = await addCompanyNames(result.data, controller.signal);
        if (controller.signal.aborted) return;
        setJobs(enriched);
        setMeta({
          page: Number(result.meta?.page ?? 1),
          totalCount: Number(result.meta?.totalCount ?? enriched.length),
          totalPages: Number(result.meta?.totalPages ?? 1),
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setJobs([]);
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadJobs();
    return () => controller.abort();
  }, [queryString]);

  function submitFilters(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const values = {
      q: String(formData.get("q") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      employmentType: String(formData.get("employmentType") ?? ""),
      experienceLevel: String(formData.get("experienceLevel") ?? ""),
    };
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    router.push(`/jobs${params.size ? `?${params}` : ""}`);
  }

  function changePage(page: number) {
    const params = new URLSearchParams(queryString);
    params.set("page", String(page));
    router.push(`/jobs?${params}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900">
      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
            Job board
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Find your next opportunity
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Search published roles and narrow the list by location, work type,
            or experience level.
          </p>

          <form
            key={queryString}
            onSubmit={submitFilters}
            className="mt-7 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_0.8fr_auto] dark:border-slate-800 dark:bg-slate-900"
          >
            <label className="relative">
              <span className="sr-only">Keywords</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                placeholder="Title, skill, or keyword"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/50"
              />
            </label>
            <label>
              <span className="sr-only">Location</span>
              <input
                type="search"
                name="location"
                defaultValue={searchParams.get("location") ?? ""}
                placeholder="Location"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/50"
              />
            </label>
            <label>
              <span className="sr-only">Employment type</span>
              <select
                name="employmentType"
                defaultValue={searchParams.get("employmentType") ?? ""}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-orange-900/50"
              >
                <option value="">All types</option>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Experience level</span>
              <select
                name="experienceLevel"
                defaultValue={searchParams.get("experienceLevel") ?? ""}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-orange-900/50"
              >
                <option value="">All levels</option>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Available roles
            </h2>
            {!isLoading && !error && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {meta.totalCount} role{meta.totalCount === 1 ? "" : "s"} found
              </p>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <JobGridSkeleton />
        ) : jobs.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : !error ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              No matching jobs
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try a broader keyword or remove one of the filters.
            </p>
          </div>
        ) : null}

        {meta.totalPages > 1 && !isLoading && (
          <nav
            aria-label="Job results pagination"
            className="mt-8 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => changePage(meta.page - 1)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => changePage(meta.page + 1)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsFallback />}>
      <JobBoard />
    </Suspense>
  );
}
