"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2, LineChart, Palette, Database } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

interface ApiListMeta {
  totalCount: number;
}

// A curated subset of the skill pool your seed script actually uses —
// counts below are fetched live, never hardcoded, so this stays accurate
// as real job postings are added or removed.
const SKILLS = [
  { skill: "javascript", label: "JavaScript", icon: Code2 },
  { skill: "sql", label: "SQL & Data", icon: LineChart },
  { skill: "figma", label: "Design", icon: Palette },
  { skill: "aws", label: "Cloud & AWS", icon: Database },
];

export function PopularSkills() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const results = await Promise.all(
        SKILLS.map(async ({ skill }) => {
          try {
            const res = await fetch(
              `${API_BASE}/jobs?skill=${encodeURIComponent(skill)}&limit=1`,
            );
            const json = (await res.json()) as {
              success: boolean;
              meta?: ApiListMeta;
            };
            return [
              skill,
              json.success ? (json.meta?.totalCount ?? 0) : null,
            ] as const;
          } catch {
            return [skill, null] as const;
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
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-slate-900">Popular Skills</h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map(({ skill, label, icon: Icon }) => {
            const count = counts[skill];
            return (
              <Link
                key={skill}
                href={`/jobs?skill=${encodeURIComponent(skill)}`}
                className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-700" strokeWidth={2} />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  {label}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {count === null
                    ? "—"
                    : count === undefined
                      ? "Loading..."
                      : `${count} Job${count === 1 ? "" : "s"}`}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
