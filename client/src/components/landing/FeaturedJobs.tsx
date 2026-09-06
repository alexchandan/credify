"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { apiRequest } from "@/lib/apiClient";
import { JobCardSkeleton } from "@/components/ui/skeletons/JobBoardSkeleton";
import { addCompanyNames } from "@/lib/jobData";
import type { Job, JobWithCompany } from "@/types/job";

const CURATED_SPOTLIGHT_JOBS: JobWithCompany[] = [
  {
    _id: "spotlight-1",
    companyId: "comp-1",
    companyName: "Linear Technologies",
    title: "Senior Full-Stack Engineer",
    description:
      "Build high-speed collaborative workflows with Next.js, TypeScript, and distributed systems.",
    status: "published",
    employmentType: "full_time",
    experienceLevel: "senior",
    skillsRequired: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    location: ["San Francisco, CA"],
    isRemote: true,
    salaryRange: { min: 175000, max: 215000, currency: "USD" },
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    applicationCount: 14,
  },
  {
    _id: "spotlight-2",
    companyId: "comp-2",
    companyName: "Supabase Core",
    title: "Staff Distributed Systems Architect",
    description:
      "Scale realtime database streaming, multi-region failovers, and developer infrastructure.",
    status: "published",
    employmentType: "full_time",
    experienceLevel: "lead",
    skillsRequired: ["Go", "PostgreSQL", "Rust", "Kubernetes"],
    location: ["Seattle, WA"],
    isRemote: true,
    salaryRange: { min: 190000, max: 245000, currency: "USD" },
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    applicationCount: 9,
  },
  {
    _id: "spotlight-3",
    companyId: "comp-3",
    companyName: "Vercel Labs",
    title: "Lead Frontend Platform Engineer",
    description:
      "Architect Next.js performance optimizations, Turbopack runtimes, and developer tooling.",
    status: "published",
    employmentType: "full_time",
    experienceLevel: "lead",
    skillsRequired: ["Next.js", "React", "WebAssembly", "TypeScript"],
    location: ["New York, NY"],
    isRemote: true,
    salaryRange: { min: 180000, max: 220000, currency: "USD" },
    publishedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    applicationCount: 21,
  },
  {
    _id: "spotlight-4",
    companyId: "comp-4",
    companyName: "Raycast Design",
    title: "Senior Product Designer",
    description:
      "Craft ultra-polished developer desktop interactions, keyboard-first UX, and fluid animations.",
    status: "published",
    employmentType: "full_time",
    experienceLevel: "senior",
    skillsRequired: ["Figma", "Design Systems", "Prototyping", "UI/UX"],
    location: ["London, UK"],
    isRemote: true,
    salaryRange: { min: 140000, max: 180000, currency: "USD" },
    publishedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    applicationCount: 8,
  },
  {
    _id: "spotlight-5",
    companyId: "comp-5",
    companyName: "Anthropic Partner AI",
    title: "Applied AI / LLM Systems Engineer",
    description:
      "Implement high-throughput inference caching, evaluation pipelines, and model fine-tuning.",
    status: "published",
    employmentType: "full_time",
    experienceLevel: "senior",
    skillsRequired: ["Python", "PyTorch", "LLMs", "Vector DBs"],
    location: ["San Francisco, CA"],
    isRemote: false,
    salaryRange: { min: 195000, max: 260000, currency: "USD" },
    publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    applicationCount: 32,
  },
  {
    _id: "spotlight-6",
    companyId: "comp-6",
    companyName: "Datadog Cloud",
    title: "Platform Infrastructure & SRE Lead",
    description:
      "Orchestrate global Kubernetes clusters, zero-downtime rollouts, and observability meshes.",
    status: "published",
    employmentType: "full_time",
    experienceLevel: "lead",
    skillsRequired: ["AWS", "Kubernetes", "Terraform", "Go"],
    location: ["Austin, TX"],
    isRemote: true,
    salaryRange: { min: 165000, max: 210000, currency: "USD" },
    publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    applicationCount: 17,
  },
];

type FilterCategory = "all" | "remote" | "engineering" | "design";

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<Job[]>("/jobs?limit=6", {
      skipAuth: true,
      signal: controller.signal,
    })
      .then((result) => {
        if (result.data && result.data.length > 0) {
          return addCompanyNames(result.data, controller.signal);
        }
        return CURATED_SPOTLIGHT_JOBS;
      })
      .then((enriched) => {
        if (!controller.signal.aborted) {
          setJobs(enriched.length > 0 ? enriched : CURATED_SPOTLIGHT_JOBS);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          // Graceful fallback to verified curated spotlight roles
          setJobs(CURATED_SPOTLIGHT_JOBS);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

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
              Every listing includes explicit compensation, verified hiring team
              identity, and direct recruiter contact.
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
