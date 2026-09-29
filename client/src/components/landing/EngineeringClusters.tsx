"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Cloud,
  Code2,
  Cpu,
  Layers,
  Server,
} from "lucide-react";

const CLUSTERS = [
  {
    title: "Frontend & Full-Stack",
    rolesCount: "3,420 roles",
    description: "React, Next.js, TypeScript, Design Systems, State Machines",
    medianPay: "$160,000 / yr",
    query: "frontend",
    icon: Code2,
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
  },
  {
    title: "Backend & Systems",
    rolesCount: "2,850 roles",
    description: "Go, Rust, Distributed Systems, Kafka, High Throughput",
    medianPay: "$175,000 / yr",
    query: "backend",
    icon: Server,
    iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400",
  },
  {
    title: "AI & Machine Learning",
    rolesCount: "1,940 roles",
    description: "LLM Fine-tuning, PyTorch, Vector DBs, Model Serving",
    medianPay: "$195,000 / yr",
    query: "ai",
    icon: Cpu,
    iconBg:
      "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
  },
  {
    title: "Cloud & DevOps",
    rolesCount: "1,420 roles",
    description: "Kubernetes, Terraform, AWS/GCP, SRE, Observability",
    medianPay: "$170,000 / yr",
    query: "devops",
    icon: Cloud,
    iconBg:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    title: "UI/UX & Product Design",
    rolesCount: "880 roles",
    description: "Design Systems, User Research, Interaction, Figma",
    medianPay: "$150,000 / yr",
    query: "design",
    icon: Layers,
    iconBg:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  },
  {
    title: "Data & Analytics",
    rolesCount: "1,120 roles",
    description: "dbt, Snowflake, Spark, Analytics Engineering, BI",
    medianPay: "$165,000 / yr",
    query: "data",
    icon: BarChart3,
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  },
];

export function EngineeringClusters() {
  return (
    <section
      aria-label="Explore Curated Engineering Clusters"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header with Left Title and Right Action */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-50 px-3.5 py-1 text-xs font-bold tracking-wider text-sky-700 uppercase dark:border-sky-500/30 dark:bg-sky-950/60 dark:text-sky-300">
              ACTIVE TALENT MARKETS
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Explore Curated Engineering Clusters
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              All roles feature validated median compensation and verified
              hiring managers.
            </p>
          </div>

          <Link
            href="/jobs"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 sm:self-end dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <span>View all categories</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* 6 Cluster Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CLUSTERS.map((cluster) => {
            const Icon = cluster.icon;
            return (
              <Link
                key={cluster.title}
                href={`/jobs?q=${encodeURIComponent(cluster.query)}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                <div>
                  {/* Top row: Icon and Roles badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${cluster.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {cluster.rolesCount}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 text-lg font-bold text-slate-950 transition group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
                    {cluster.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {cluster.description}
                  </p>
                </div>

                {/* Bottom line: Median Pay */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Median Pay:{" "}
                    <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {cluster.medianPay}
                    </strong>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-emerald-400" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
