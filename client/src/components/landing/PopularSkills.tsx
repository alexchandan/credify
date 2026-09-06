"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  Layers,
  Palette,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL as API_BASE } from "@/lib/apiBaseUrl";

interface SkillCategory {
  skill: string;
  label: string;
  queryParam: string;
  icon: typeof Code2;
  avgSalary: string;
  defaultCount: number;
  popularTech: string[];
  accent: string;
  trending?: boolean;
}

const CATEGORIES: SkillCategory[] = [
  {
    skill: "javascript",
    queryParam: "javascript",
    label: "Frontend & Full-Stack",
    icon: Code2,
    avgSalary: "$125k – $185k",
    defaultCount: 342,
    popularTech: ["React", "Next.js", "TypeScript", "Tailwind"],
    accent:
      "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-100 dark:border-cyan-900/40",
    trending: true,
  },
  {
    skill: "node",
    queryParam: "backend",
    label: "Backend & Systems",
    icon: Layers,
    avgSalary: "$135k – $195k",
    defaultCount: 284,
    popularTech: ["Node.js", "Go", "PostgreSQL", "GraphQL"],
    accent:
      "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-900/40",
  },
  {
    skill: "python",
    queryParam: "ai",
    label: "AI, ML & Data Science",
    icon: BrainCircuit,
    avgSalary: "$155k – $230k",
    defaultCount: 219,
    popularTech: ["PyTorch", "LLMs", "LangChain", "Vector DBs"],
    accent:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/40",
    trending: true,
  },
  {
    skill: "aws",
    queryParam: "aws",
    label: "Cloud & Platform DevOps",
    icon: Cloud,
    avgSalary: "$140k – $205k",
    defaultCount: 196,
    popularTech: ["AWS", "Kubernetes", "Docker", "Terraform"],
    accent:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/40",
  },
  {
    skill: "figma",
    queryParam: "figma",
    label: "UI/UX & Product Design",
    icon: Palette,
    avgSalary: "$115k – $170k",
    defaultCount: 154,
    popularTech: ["Figma", "Design Systems", "Prototyping", "UX Research"],
    accent:
      "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/40",
  },
  {
    skill: "sql",
    queryParam: "sql",
    label: "Data & Analytics",
    icon: Database,
    avgSalary: "$130k – $180k",
    defaultCount: 178,
    popularTech: ["SQL", "Snowflake", "dbt", "BigQuery"],
    accent:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/40",
  },
];

export function PopularSkills() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const results = await Promise.all(
        CATEGORIES.map(async ({ skill, defaultCount }) => {
          try {
            const res = await fetch(
              `${API_BASE}/jobs?skill=${encodeURIComponent(skill)}&limit=1`,
            );
            const json = await res.json();
            if (
              json.success &&
              typeof json.meta?.totalCount === "number" &&
              json.meta.totalCount > 0
            ) {
              return [skill, json.meta.totalCount] as const;
            }
            return [skill, defaultCount] as const;
          } catch {
            return [skill, defaultCount] as const;
          }
        }),
      );
      if (!cancelled) {
        setCounts(Object.fromEntries(results));
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-slate-50/70 px-5 py-16 sm:px-6 sm:py-20 lg:px-8 dark:bg-slate-950/60">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
              High-growth domains
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Explore opportunities by craft
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Discover verified roles matched to your specific tech stack, with
              transparent market compensation bands.
            </p>
          </div>
          <Link
            href="/jobs"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Browse all categories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(
            ({
              skill,
              queryParam,
              label,
              icon: Icon,
              avgSalary,
              defaultCount,
              popularTech,
              accent,
              trending,
            }) => {
              const count = counts[skill] ?? defaultCount;
              return (
                <Link
                  key={skill}
                  href={`/jobs?skill=${encodeURIComponent(queryParam)}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 transition-all hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/5 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50 dark:hover:shadow-cyan-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accent} transition-transform group-hover:scale-105`}
                      >
                        <Icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      {trending && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
                          <Sparkles className="h-3 w-3" />
                          High Demand
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
                      {label}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Typical Compensation:{" "}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {avgSalary}
                      </span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {popularTech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-400">
                      {count} open roles
                    </span>
                    <span className="inline-flex items-center gap-1 text-cyan-600 group-hover:underline dark:text-cyan-400">
                      View roles
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
