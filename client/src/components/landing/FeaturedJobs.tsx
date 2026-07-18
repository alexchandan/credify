"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Wallet } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

interface JobSummary {
  _id: string;
  companyId: string;
  title: string;
  employmentType: string;
  location: string[];
  isRemote: boolean;
  salaryRange?: { min?: number; max?: number; currency?: string };
}

interface FeaturedJob extends JobSummary {
  companyName: string;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    const json = (await res.json()) as { success: boolean; data?: T };
    return json.success ? (json.data ?? null) : null;
  } catch {
    return null;
  }
}

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<FeaturedJob[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const list = await fetchJson<JobSummary[]>(`${API_BASE}/jobs?limit=3`);
      if (!list || cancelled) {
        if (!cancelled) setJobs([]);
        return;
      }

      // Job doesn't carry a company name directly — only companyId — so
      // each card needs its own company lookup, same pattern the real
      // Job Detail page already uses.
      const withCompanies = await Promise.all(
        list.map(async (job) => {
          const company = await fetchJson<{ name: string }>(
            `${API_BASE}/companies/${job.companyId}`,
          );
          return { ...job, companyName: company?.name ?? "Unknown company" };
        }),
      );

      if (!cancelled) setJobs(withCompanies);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Jobs</h2>
          <Link
            href="/jobs"
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            View all →
          </Link>
        </div>

        {jobs === null && (
          <p className="mt-8 text-sm text-slate-500">Loading jobs...</p>
        )}
        {jobs !== null && jobs.length === 0 && (
          <p className="mt-8 text-sm text-slate-500">
            No published jobs yet — check back soon.
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {jobs?.map((job) => (
            <div
              key={job._id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Building2
                    className="h-5 w-5 text-blue-700"
                    strokeWidth={2}
                  />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {job.employmentType.replace("_", " ")}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500">{job.companyName}</p>

              <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.isRemote
                    ? "Remote"
                    : job.location.join(", ") || "Location not specified"}
                </span>
                {job.salaryRange &&
                  (job.salaryRange.min || job.salaryRange.max) && (
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      {job.salaryRange.min?.toLocaleString()} –{" "}
                      {job.salaryRange.max?.toLocaleString()}{" "}
                      {job.salaryRange.currency}
                    </span>
                  )}
              </div>

              <Link
                href={`/jobs/${job._id}`}
                className="mt-5 rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-emerald-800"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
