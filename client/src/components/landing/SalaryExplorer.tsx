"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

type RoleId = "fullstack" | "frontend" | "backend" | "ai" | "devops" | "design";
type LevelId = "junior" | "mid" | "senior" | "staff";

interface SalaryBenchmark {
  roleName: string;
  queryParam: string;
  levels: Record<
    LevelId,
    {
      min: number;
      median: number;
      max: number;
      timeToOfferDays: number;
      skills: string[];
    }
  >;
}

const BENCHMARKS: Record<RoleId, SalaryBenchmark> = {
  fullstack: {
    roleName: "Full-Stack Engineer",
    queryParam: "full stack",
    levels: {
      junior: {
        min: 85000,
        median: 105000,
        max: 125000,
        timeToOfferDays: 16,
        skills: ["React", "TypeScript", "Node.js"],
      },
      mid: {
        min: 120000,
        median: 145000,
        max: 170000,
        timeToOfferDays: 14,
        skills: ["Next.js", "PostgreSQL", "Tailwind CSS"],
      },
      senior: {
        min: 165000,
        median: 190000,
        max: 225000,
        timeToOfferDays: 12,
        skills: ["System Design", "Cloud Infra", "GraphQL"],
      },
      staff: {
        min: 210000,
        median: 245000,
        max: 300000,
        timeToOfferDays: 10,
        skills: ["Architecture", "Org Leadership", "Distributed Systems"],
      },
    },
  },
  frontend: {
    roleName: "Frontend Engineer",
    queryParam: "frontend",
    levels: {
      junior: {
        min: 80000,
        median: 98000,
        max: 120000,
        timeToOfferDays: 18,
        skills: ["HTML/CSS", "JavaScript", "React"],
      },
      mid: {
        min: 115000,
        median: 138000,
        max: 160000,
        timeToOfferDays: 14,
        skills: ["TypeScript", "Next.js", "Performance"],
      },
      senior: {
        min: 155000,
        median: 180000,
        max: 215000,
        timeToOfferDays: 11,
        skills: ["Core Web Vitals", "State Architecture", "Design Systems"],
      },
      staff: {
        min: 200000,
        median: 235000,
        max: 285000,
        timeToOfferDays: 9,
        skills: ["Browser Engines", "WebAssembly", "Microfrontends"],
      },
    },
  },
  backend: {
    roleName: "Backend & Systems Engineer",
    queryParam: "backend",
    levels: {
      junior: {
        min: 90000,
        median: 110000,
        max: 130000,
        timeToOfferDays: 17,
        skills: ["Node.js", "SQL", "REST APIs"],
      },
      mid: {
        min: 125000,
        median: 150000,
        max: 180000,
        timeToOfferDays: 13,
        skills: ["Go", "PostgreSQL", "Redis", "Docker"],
      },
      senior: {
        min: 170000,
        median: 200000,
        max: 240000,
        timeToOfferDays: 11,
        skills: ["Distributed Systems", "Kafka", "High Throughput"],
      },
      staff: {
        min: 225000,
        median: 265000,
        max: 320000,
        timeToOfferDays: 9,
        skills: ["Zero-Downtime DBs", "Consensus Algorithms", "Global Mesh"],
      },
    },
  },
  ai: {
    roleName: "AI / Machine Learning Engineer",
    queryParam: "ai",
    levels: {
      junior: {
        min: 95000,
        median: 120000,
        max: 145000,
        timeToOfferDays: 16,
        skills: ["Python", "Pandas", "Scikit-Learn"],
      },
      mid: {
        min: 140000,
        median: 170000,
        max: 205000,
        timeToOfferDays: 12,
        skills: ["PyTorch", "Hugging Face", "Vector DBs"],
      },
      senior: {
        min: 185000,
        median: 225000,
        max: 275000,
        timeToOfferDays: 10,
        skills: ["LLM Fine-Tuning", "RAG Pipelines", "Inference Optimization"],
      },
      staff: {
        min: 250000,
        median: 310000,
        max: 400000,
        timeToOfferDays: 8,
        skills: [
          "Frontier Model Training",
          "GPU Clusters",
          "Distributed Compute",
        ],
      },
    },
  },
  devops: {
    roleName: "Cloud & DevOps Engineer",
    queryParam: "devops",
    levels: {
      junior: {
        min: 88000,
        median: 108000,
        max: 128000,
        timeToOfferDays: 19,
        skills: ["Linux", "Bash", "AWS Basics"],
      },
      mid: {
        min: 125000,
        median: 148000,
        max: 175000,
        timeToOfferDays: 14,
        skills: ["Kubernetes", "Terraform", "CI/CD Pipelines"],
      },
      senior: {
        min: 165000,
        median: 195000,
        max: 235000,
        timeToOfferDays: 12,
        skills: ["Multi-Cloud", "SRE Observability", "Security Auditing"],
      },
      staff: {
        min: 215000,
        median: 255000,
        max: 310000,
        timeToOfferDays: 9,
        skills: ["Global Edge Infra", "FinOps", "Disaster Recovery"],
      },
    },
  },
  design: {
    roleName: "Product Designer (UI/UX)",
    queryParam: "product design",
    levels: {
      junior: {
        min: 75000,
        median: 92000,
        max: 110000,
        timeToOfferDays: 18,
        skills: ["Figma", "Wireframing", "User Journeys"],
      },
      mid: {
        min: 110000,
        median: 132000,
        max: 155000,
        timeToOfferDays: 14,
        skills: ["Design Systems", "Prototyping", "User Testing"],
      },
      senior: {
        min: 145000,
        median: 172000,
        max: 205000,
        timeToOfferDays: 11,
        skills: ["Product Strategy", "Interaction Design", "Motion"],
      },
      staff: {
        min: 190000,
        median: 225000,
        max: 270000,
        timeToOfferDays: 9,
        skills: ["Design Vision", "Cross-Platform", "Design Ops"],
      },
    },
  },
};

const ROLES: { id: RoleId; label: string }[] = [
  { id: "fullstack", label: "Full-Stack" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend & Systems" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "devops", label: "Cloud & DevOps" },
  { id: "design", label: "Product Design" },
];

const LEVELS: { id: LevelId; label: string; experience: string }[] = [
  { id: "junior", label: "Junior", experience: "0-2 yrs" },
  { id: "mid", label: "Mid-Level", experience: "3-5 yrs" },
  { id: "senior", label: "Senior", experience: "5-8 yrs" },
  { id: "staff", label: "Staff / Lead", experience: "8+ yrs" },
];

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function SalaryExplorer() {
  const [selectedRole, setSelectedRole] = useState<RoleId>("fullstack");
  const [selectedLevel, setSelectedLevel] = useState<LevelId>("senior");

  const currentData = useMemo(() => {
    return BENCHMARKS[selectedRole].levels[selectedLevel];
  }, [selectedRole, selectedLevel]);

  const roleMeta = BENCHMARKS[selectedRole];

  return (
    <section className="relative border-t border-slate-200/80 bg-slate-50/50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8 dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300">
            <Calculator className="h-3 w-3" />
            100% Upfront Pay Guarantee
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Interactive Compensation Radar
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Know what you are worth before you interview. Compare verified
            salary data across roles and seniority tiers.
          </p>
        </div>

        {/* Controls Container */}
        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
          {/* Step 1: Select Role */}
          <div>
            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              1. Select Discipline
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    selectedRole === role.id
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20 dark:bg-cyan-500 dark:text-slate-950"
                      : "border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Level */}
          <div className="mt-6">
            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              2. Select Seniority Tier
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                    selectedLevel === lvl.id
                      ? "border-2 border-cyan-500 bg-cyan-50/70 text-cyan-900 shadow-sm dark:border-cyan-400 dark:bg-cyan-950/60 dark:text-cyan-200"
                      : "border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-sm font-bold">{lvl.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lvl.experience}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Output Display Card */}
          <div className="mt-8 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold tracking-wide text-cyan-600 dark:text-cyan-400">
                  {roleMeta.roleName} •{" "}
                  {LEVELS.find((l) => l.id === selectedLevel)?.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                    {formatCurrency(currentData.median)}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    / year median base
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Typical Market Range
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(currentData.min)} –{" "}
                  {formatCurrency(currentData.max)}
                </span>
              </div>
            </div>

            {/* Range Visualizer Bar */}
            <div className="mt-5">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="absolute inset-y-0 right-[15%] left-[15%] rounded-full bg-linear-to-r from-cyan-500 to-emerald-400" />
                <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-md dark:border-slate-900 dark:bg-white" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span>
                  Entry percentile ({formatCurrency(currentData.min)})
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Median: {formatCurrency(currentData.median)}
                </span>
                <span>Top tier ({formatCurrency(currentData.max)})</span>
              </div>
            </div>

            {/* In-Demand Skills & Metrics */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200/80 pt-5 sm:grid-cols-2 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Highest impact skills for this bracket:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {currentData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200/60 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-2xs dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center sm:items-end">
                <Link
                  href={`/jobs?q=${encodeURIComponent(roleMeta.queryParam)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                >
                  <span>Explore open roles in this band</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
