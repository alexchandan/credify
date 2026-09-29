"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/ui/skeletons/JobBoardSkeleton";
import type { JobWithCompany } from "@/types/job";

type FilterCategory = "all" | "remote" | "engineering" | "design";

interface FeaturedJobsProps {
  jobs: JobWithCompany[];
  isLoading: boolean;
}

export function FeaturedJobs({ jobs, isLoading }: FeaturedJobsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filteredJobs = useMemo(() => {
    if (activeFilter === "remote") {
      return jobs.filter((job) => job.isRemote);
    }
    if (activeFilter === "engineering") {
      return jobs.filter(
        (job) =>
          job.title.toLowerCase().includes("engineer") ||
          job.title.toLowerCase().includes("systems") ||
          job.title.toLowerCase().includes("architect") ||
          job.title.toLowerCase().includes("devops"),
      );
    }
    if (activeFilter === "design") {
      return jobs.filter(
        (job) =>
          job.title.toLowerCase().includes("design") ||
          job.title.toLowerCase().includes("product"),
      );
    }
    return jobs;
  }, [jobs, activeFilter]);

  return (
    <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Sparkles className="h-3 w-3" />
              Verified Open Roles
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Featured opportunities
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-300">
              The newest published roles, with salary ranges shown whenever an
              employer has disclosed them.
            </p>
          </div>

          <Link
            href="/jobs"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-semibold text-cyan-600 hover:text-cyan-700 md:self-end dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Browse all verified jobs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All Opportunities" },
              { id: "remote", label: "100% Remote" },
              { id: "engineering", label: "Engineering & Systems" },
              { id: "design", label: "Product & Design" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? "bg-slate-900 text-white shadow-md dark:bg-cyan-500 dark:text-slate-950"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-5 py-12 text-center dark:border-white/10 dark:bg-slate-900/50">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No published jobs matched this filter.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
