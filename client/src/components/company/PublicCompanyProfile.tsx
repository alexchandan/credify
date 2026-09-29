"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  ExternalLink,
  RefreshCw,
  Users,
} from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { apiRequest } from "@/lib/apiClient";
import { formatIndianNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/formErrors";
import type { Job, JobWithCompany } from "@/types/job";
import type { Company } from "@/types/recruiter";

interface PublicCompanyProfileProps {
  companyId: string;
}

export function PublicCompanyProfile({ companyId }: PublicCompanyProfileProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCompany() {
      try {
        const [companyResult, jobsResult] = await Promise.all([
          apiRequest<Company>(`/companies/${companyId}`, {
            skipAuth: true,
            signal: controller.signal,
          }),
          apiRequest<Job[]>(
            `/jobs?companyId=${encodeURIComponent(companyId)}&limit=50`,
            { skipAuth: true, signal: controller.signal },
          ),
        ]);
        if (controller.signal.aborted) return;

        setCompany(companyResult.data);
        setJobs(
          jobsResult.data.map((job) => ({
            ...job,
            companyName: companyResult.data.name,
          })),
        );
        setError(null);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(loadError));
          setCompany(null);
          setJobs([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadCompany();
    return () => controller.abort();
  }, [companyId, reloadKey]);

  if (isLoading) return <CompanyProfileSkeleton />;

  if (error || !company) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-20 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-lg dark:border-rose-900/50 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600 dark:text-rose-400" />
          <h1 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
            We couldn&apos;t load this company
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error ?? "The company may no longer be available."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/jobs"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" /> Jobs
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setReloadKey((value) => value + 1);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <header className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={`${company.name} logo`}
                width={88}
                height={88}
                className="h-22 w-22 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <span className="flex h-22 w-22 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400">
                <Building2 className="h-10 w-10" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
                Company profile
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                {company.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                {company.industry && <span>{company.industry}</span>}
                {company.size && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {company.size} employees
                  </span>
                )}
                <span>{formatIndianNumber(jobs.length)} open roles</span>
              </div>
            </div>

            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-400"
              >
                Visit website <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {company.description && (
            <p className="mt-7 max-w-4xl text-sm leading-7 whitespace-pre-line text-slate-600 dark:text-slate-300">
              {company.description}
            </p>
          )}
        </header>

        <section className="mt-10" aria-labelledby="company-open-jobs">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
                Live opportunities
              </p>
              <h2
                id="company-open-jobs"
                className="mt-1 text-2xl font-bold text-slate-950 dark:text-white"
              >
                Open jobs at {company.name}
              </h2>
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {formatIndianNumber(jobs.length)} roles
            </span>
          </div>

          {jobs.length > 0 ? (
            <div className="mt-5 space-y-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              This company has no published jobs right now.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function CompanyProfileSkeleton() {
  return (
    <div className="flex-1 bg-slate-50/70 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-900" />
        <div className="mt-10 h-7 w-56 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
