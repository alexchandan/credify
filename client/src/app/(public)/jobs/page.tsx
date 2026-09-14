"use client";

import { Suspense, useEffect, useState } from "react";
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
    <div className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <section className="border-b border-slate-200/80 bg-white px-4 py-10 sm:px-6 dark:border-white/10 dark:bg-slate-950/60">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
            Job board
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Find your next opportunity
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Search published roles and narrow the list by location, work type,
            or experience level.
          </p>

          <form
            key={queryString}
            onSubmit={submitFilters}
            className="mt-7 grid gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_0.8fr_auto] dark:border-white/10 dark:bg-slate-900"
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
                className="h-11 w-full rounded-lg border border-slate-300/90 bg-white pr-3 pl-9 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-500/30"
              />
            </label>
            <label>
              <span className="sr-only">Location</span>
              <input
                type="search"
                name="location"
                defaultValue={searchParams.get("location") ?? ""}
                placeholder="Location"
                className="h-11 w-full rounded-lg border border-slate-300/90 bg-white px-3 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-500/30"
              />
            </label>
            <label>
              <span className="sr-only">Employment type</span>
              <select
                name="employmentType"
                defaultValue={searchParams.get("employmentType") ?? ""}
                className="h-11 w-full rounded-lg border border-slate-300/90 bg-white px-3 text-sm text-slate-800 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-cyan-500/30"
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
                className="h-11 w-full rounded-lg border border-slate-300/90 bg-white px-3 text-sm text-slate-800 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-cyan-500/30"
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white shadow-sm shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99] dark:from-cyan-500 dark:via-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:shadow-cyan-500/20 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List view"
              aria-label="List view"
              className={`rounded-lg p-1.5 transition ${
                viewMode === "list"
                  ? "bg-cyan-50 text-cyan-700 shadow-xs dark:bg-cyan-950/60 dark:text-cyan-400"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid view"
              aria-label="Grid view"
              className={`rounded-lg p-1.5 transition ${
                viewMode === "grid"
                  ? "bg-cyan-50 text-cyan-700 shadow-xs dark:bg-cyan-950/60 dark:text-cyan-400"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <JobGridSkeleton variant={viewMode} />
        ) : jobs.length > 0 ? (
          viewMode === "list" ? (
            <div className="mt-6 space-y-3.5">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} variant="list" />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} variant="card" />
              ))}
            </div>
          )
        ) : !error ? (
          <div className="mt-6 rounded-xl border border-slate-200/80 bg-white px-6 py-12 text-center dark:border-white/10 dark:bg-slate-900">
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
              className="h-10 rounded-lg border border-slate-300/80 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/60 dark:hover:text-cyan-400"
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
              className="h-10 rounded-lg border border-slate-300/80 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/60 dark:hover:text-cyan-400"
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
