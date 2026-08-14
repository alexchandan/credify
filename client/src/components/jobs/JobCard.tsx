import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, MapPin, Wallet } from "lucide-react";
import { formatJobLabel, formatSalary } from "@/lib/jobData";
import type { JobWithCompany } from "@/types/job";

export function JobCard({ job }: { job: JobWithCompany }) {
  const location = job.isRemote
    ? "Remote"
    : job.location.join(", ") || "Location not specified";

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-orange-700">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {formatJobLabel(job.employmentType)}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
        <Link
          href={`/jobs/${job._id}`}
          className="transition hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {job.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        {job.companyName}
      </p>

      <dl className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-start gap-2">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <dt className="sr-only">Location</dt>
          <dd className="line-clamp-2">{location}</dd>
        </div>
        <div className="flex items-start gap-2">
          <Wallet
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <dt className="sr-only">Salary</dt>
          <dd>{formatSalary(job)}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <Link
          href={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
        >
          View job
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
