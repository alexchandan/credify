"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import type { AuthUser } from "@/context/AuthContext";

interface LoggedInMemberHubProps {
  user: AuthUser;
}

interface RecommendedRole {
  id: string;
  title: string;
  company: string;
  logo: string;
  logoBg: string;
  logoTextColor?: string;
  matchScore: number;
  location: string;
  hiringManager: string;
  tags: string[];
  salaryRange: string;
  equityOrBonus: string;
  description: string;
  requirements: string[];
}

interface DirectInboundItem {
  id: string;
  senderName: string;
  senderRole: string;
  senderInitials: string;
  company: string;
  compensation: string;
  message: string;
  status: "pending" | "accepted" | "declined";
}

const INITIAL_ROLES: RecommendedRole[] = [
  {
    id: "vercel-staff-systems",
    title: "Staff Systems Engineer",
    company: "Vercel",
    logo: "▲",
    logoBg: "bg-black",
    logoTextColor: "text-white",
    matchScore: 98,
    location: "Remote (US / Canada)",
    hiringManager: "Guillermo R.",
    tags: ["Next.js", "Rust", "Edge Runtime"],
    salaryRange: "$190k – $240k",
    equityOrBonus: "+ 0.2% Equity",
    description:
      "Architect and scale edge execution engines powering next-generation serverless runtimes. Direct collaboration with framework maintainers.",
    requirements: [
      "Deep experience with Rust async runtimes (Tokio)",
      "Knowledge of V8 isolates and web-standards edge environments",
      "Contributions to open-source systems software",
    ],
  },
  {
    id: "figma-lead-infra",
    title: "Lead Infrastructure Engineer",
    company: "Figma",
    logo: "F",
    logoBg: "bg-[#f24e1e]",
    logoTextColor: "text-white",
    matchScore: 95,
    location: "San Francisco / Hybrid",
    hiringManager: "Sarah C.",
    tags: ["TypeScript", "WebGL", "Distributed Systems"],
    salaryRange: "$200k – $250k",
    equityOrBonus: "+ RSU Grant",
    description:
      "Scale the real-time multiplayer multiplayer engine and cloud compute pipeline for creative tools. High-concurrency WebGL pipelines.",
    requirements: [
      "Distributed consensus & real-time state synchronization",
      "Strong TypeScript/C++ or WebAssembly background",
      "Experience optimizing high-throughput low-latency network protocols",
    ],
  },
  {
    id: "datadog-principal-cloud",
    title: "Principal Cloud Architect",
    company: "Datadog",
    logo: "DD",
    logoBg: "bg-[#632ca6]",
    logoTextColor: "text-white",
    matchScore: 92,
    location: "Remote (US)",
    hiringManager: "Marcus K.",
    tags: ["Go", "Kubernetes", "Terraform"],
    salaryRange: "$210k – $265k",
    equityOrBonus: "+ Annual Bonus",
    description:
      "Design multi-region telemetry ingestion clusters processing billions of events per second with zero-downtime failover guarantees.",
    requirements: [
      "Production-scale Go microservices & eBPF observability",
      "Kubernetes multi-cluster orchestration",
      "Large-scale distributed storage & Kafka streaming",
    ],
  },
  {
    id: "notion-senior-product",
    title: "Senior Product Engineer",
    company: "Notion",
    logo: "N",
    logoBg: "bg-slate-900",
    logoTextColor: "text-white",
    matchScore: 91,
    location: "San Francisco, CA",
    hiringManager: "David P.",
    tags: ["React", "Node.js", "PostgreSQL"],
    salaryRange: "$180k – $225k",
    equityOrBonus: "+ Equity & 401(k)",
    description:
      "Build collaborative workspace primitives, offline sync algorithms, and high-performance rich text data structures.",
    requirements: [
      "Mastery of modern React internals & optimistic UI updates",
      "Complex relational schema design in PostgreSQL",
      "Demonstrated intuition for minimalist, high-craft UX",
    ],
  },
];

const QUICK_FILTER_OPTIONS = [
  "Next.js 15",
  "TypeScript",
  "Distributed Systems",
  "Rust",
  "Remote Only",
];

export function LoggedInMemberHub({ user }: LoggedInMemberHubProps) {
  const [stealthActive, setStealthActive] = useState(true);
  const [searchRole, setSearchRole] = useState(
    "Staff / Lead Full-Stack & Systems",
  );
  const [searchLocation, setSearchLocation] = useState(
    "San Francisco / Remote",
  );
  const [minSalary, setMinSalary] = useState("$180k+");
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "Next.js 15",
    "TypeScript",
    "Distributed Systems",
    "Rust",
    "Remote Only",
  ]);

  const [inbounds, setInbounds] = useState<DirectInboundItem[]>([
    {
      id: "inbound-1",
      senderName: "Elena Rostova",
      senderRole: "VP Eng · Supabase",
      senderInitials: "ER",
      company: "Supabase",
      compensation: "$205k",
      message:
        "Reviewed your Next.js cache commit proofs. Would love to connect directly.",
      status: "pending",
    },
    {
      id: "inbound-2",
      senderName: "Thomas Liu",
      senderRole: "Head of Platform · Linear",
      senderInitials: "TL",
      company: "Linear",
      compensation: "$215k",
      message:
        "Interested in your background in distributed systems and state synchronization.",
      status: "pending",
    },
  ]);

  const [appliedRoleIds, setAppliedRoleIds] = useState<Set<string>>(new Set());
  const [activeModalRole, setActiveModalRole] =
    useState<RecommendedRole | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayName =
    user?.fullName?.trim() || (user?.email ? user.email.split("@")[0] : "Alex");
  const firstName = displayName.split(" ")[0];

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3800);
  }

  function toggleFilter(filterName: string) {
    setActiveFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName],
    );
  }

  function handleAcceptInbound(id: string) {
    setInbounds((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "accepted" } : item,
      ),
    );
    showToast(
      "Direct connection accepted! Recruiter notified via verified SLA.",
    );
  }

  function handleDeclineInbound(id: string) {
    setInbounds((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "declined" } : item,
      ),
    );
    showToast("Inbound request declined cordially.");
  }

  function handleApplyRole(role: RecommendedRole) {
    setAppliedRoleIds((prev) => new Set([...prev, role.id]));
    showToast(
      `Applied to ${role.company} via verified ZK-Proof! 48h response window initiated.`,
    );
  }

  // Filter roles based on activeFilters or searchRole
  const filteredRoles = INITIAL_ROLES.filter((role) => {
    if (activeFilters.length === 0) return true;
    const matchesTag = role.tags.some((t) => activeFilters.includes(t));
    const isRemote =
      activeFilters.includes("Remote Only") &&
      role.location.toLowerCase().includes("remote");
    return matchesTag || isRemote;
  });

  return (
    <div className="w-full bg-[#fbfcfd] pb-20 dark:bg-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="animate-in fade-in slide-in-from-top-4 fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl transition-all duration-300 dark:border-white/20 dark:bg-white dark:text-slate-950"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {/* =========================================================================
            SECTION 1: HERO / WELCOME & STATUS BANNER CARD
           ========================================================================= */}
        <section
          aria-label="Welcome and search summary"
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-7 dark:border-white/10 dark:bg-slate-900/90"
        >
          {/* Top Row: Welcome & Profile Health */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            {/* Left: Greeting & Stealth Pill */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                  Welcome back, {firstName}
                </h1>

                <button
                  type="button"
                  onClick={() => {
                    const next = !stealthActive;
                    setStealthActive(next);
                    showToast(
                      next
                        ? "Stealth mode active: current employers anonymized."
                        : "Public visibility active: profile open to all hiring teams.",
                    );
                  }}
                  title="Click to toggle stealth status"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                    stealthActive
                      ? "border-emerald-200/90 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border-sky-200/90 bg-sky-50 text-sky-800 hover:bg-sky-100/70 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      stealthActive
                        ? "animate-pulse bg-emerald-500"
                        : "bg-sky-500"
                    }`}
                  />
                  <span>
                    {stealthActive ? "Stealth Active" : "Public Visibility"}
                  </span>
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Your verified profile was reviewed by{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  3 engineering leaders
                </span>{" "}
                this week.
              </p>
            </div>

            {/* Right: Profile Health Bar & Employer Anonymized Status */}
            <div className="flex flex-wrap items-center gap-3 self-start text-xs sm:self-auto sm:text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Profile Health
              </span>

              {/* Progress bar matching inspiration */}
              <div
                className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 sm:w-36 dark:bg-slate-800"
                role="progressbar"
                aria-valuenow={95}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile Health 95 percent"
              >
                <div className="h-full w-[95%] rounded-full bg-blue-600 transition-all duration-500 dark:bg-cyan-400" />
              </div>

              <span className="font-bold text-slate-900 dark:text-white">
                95%
              </span>

              <span
                className="text-slate-300 dark:text-slate-700"
                aria-hidden="true"
              >
                |
              </span>

              <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                {stealthActive ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    <span>Employer Anonymized</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Direct Visibility</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Integrated Search Bar (Exact Segmented Bar from Inspiration) */}
          <div className="mt-6 flex flex-col items-stretch gap-2 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xs md:flex-row md:items-center dark:border-white/10 dark:bg-slate-950">
            {/* Segment 1: Role Search */}
            <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                placeholder="Job title, keywords, or skills..."
                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden sm:text-sm dark:text-white"
              />
            </div>

            {/* Vertical Divider */}
            <div
              className="hidden h-6 w-px bg-slate-200 md:block dark:bg-slate-800"
              aria-hidden="true"
            />

            {/* Segment 2: Location */}
            <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Location or Remote"
                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden sm:text-sm dark:text-white"
              />
            </div>

            {/* Segment 3: Salary Filter Pill */}
            <div className="flex items-center justify-between px-3 py-1.5 md:justify-start">
              <button
                type="button"
                onClick={() => {
                  const options = ["$160k+", "$180k+", "$200k+", "$220k+"];
                  const idx = options.indexOf(minSalary);
                  const next = options[(idx + 1) % options.length];
                  setMinSalary(next);
                  showToast(`Compensation floor adjusted to ${next}`);
                }}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {minSalary}
              </button>
            </div>

            {/* Segment 4: Search Button */}
            <Link
              href={`/jobs?q=${encodeURIComponent(searchRole)}&loc=${encodeURIComponent(searchLocation)}`}
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] sm:text-sm dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
            >
              <span>Search Roles</span>
            </Link>
          </div>

          {/* Quick Filters Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-slate-400">Quick filters:</span>
            {QUICK_FILTER_OPTIONS.map((filter) => {
              const active = activeFilters.includes(filter);
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => toggleFilter(filter)}
                  className={`rounded-lg border px-3 py-1 font-semibold transition-all ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-slate-950"
                      : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: ACTIVE APPLICATION PIPELINE
           ========================================================================= */}
        <section
          aria-label="Active application pipeline"
          className="mt-8 space-y-4"
        >
          {/* Header Row */}
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Active Application Pipeline
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                3 Active
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Guaranteed 48h SLA response</span>
            </div>
          </div>

          {/* 3 Active Pipeline Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Linear */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/90 dark:hover:border-white/20">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                      LN
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        Linear
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Staff Frontend Architect
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Offer
                  </span>
                </div>

                <div className="mt-6 flex items-baseline justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Compensation:
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                      $195,000 / yr
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      + 0.15% Equity · Expires in 24h
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(true)}
                  className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                  Compensation Review
                </button>
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(true)}
                  className="rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                >
                  Review Offer
                </button>
              </div>
            </div>

            {/* Card 2: Supabase */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/90 dark:hover:border-white/20">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white">
                      SB
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        Supabase
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Lead Backend Engineer
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300">
                    Interview
                  </span>
                </div>

                <div className="mt-6 flex items-baseline justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Next Round:
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                      Tomorrow, 2:00 PM
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      VP of Eng &amp; Lead Architect
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Stage 3 of 4
                </span>
                <button
                  type="button"
                  onClick={() => setInterviewModalOpen(true)}
                  className="rounded-lg border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Join Room
                </button>
              </div>
            </div>

            {/* Card 3: Stripe */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/90 dark:hover:border-white/20">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                      ST
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        Stripe
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Senior Infrastructure Engineer
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                    HM Review
                  </span>
                </div>

                <div className="mt-6 flex items-baseline justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    SLA Window:
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-sm font-extrabold text-slate-950 dark:text-white">
                      18h : 14m left
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      48-hour response bond locked
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>Applied via ZK Proof</span>
                </span>
                <Link
                  href="/candidate/applications"
                  className="rounded-lg border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: TWO-COLUMN MAIN AREA (RECOMMENDED ROLES + SIDEBAR)
           ========================================================================= */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* -----------------------------------------------------------------------
              LEFT COLUMN (lg:col-span-8): RECOMMENDED ROLES
             ----------------------------------------------------------------------- */}
          <div className="space-y-4 lg:col-span-8">
            {/* Header */}
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  Recommended Roles
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curated for your verified stack and salary requirements.
                </p>
              </div>

              <Link
                href="/jobs"
                className="group inline-flex items-center gap-1 text-xs font-bold text-slate-700 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-cyan-400"
              >
                <span>Browse all 1,420 roles</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* List of Role Cards */}
            <div className="space-y-3">
              {filteredRoles.map((role) => {
                const isApplied = appliedRoleIds.has(role.id);
                return (
                  <article
                    key={role.id}
                    className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 sm:flex-row sm:items-center dark:border-white/10 dark:bg-slate-900/90 dark:hover:border-white/20"
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-4">
                      {/* Logo Icon */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${role.logoBg} ${
                          role.logoTextColor ?? "text-white"
                        }`}
                      >
                        {role.logo}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-950 sm:text-base dark:text-white">
                            {role.title}
                          </h3>
                          <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/60 dark:text-sky-300">
                            {role.matchScore}% match
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {role.company} · {role.location} ·{" "}
                          {role.hiringManager}
                        </p>

                        {/* Tech tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {role.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-white/5 dark:bg-slate-800/80 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Salary & Buttons */}
                    <div className="flex flex-col items-start gap-3 border-t border-slate-100 pt-3 sm:items-end sm:border-t-0 sm:pt-0 dark:border-white/5">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-extrabold text-slate-950 sm:text-base dark:text-white">
                          {role.salaryRange}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {role.equityOrBonus}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModalRole(role)}
                          className="rounded-lg border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyRole(role)}
                          disabled={isApplied}
                          className={`rounded-lg px-4 py-1.5 text-xs font-bold transition active:scale-95 ${
                            isApplied
                              ? "cursor-default bg-emerald-600 text-white"
                              : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                          }`}
                        >
                          {isApplied ? "Applied ✓" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN (lg:col-span-4): SIDEBAR WIDGETS
             ----------------------------------------------------------------------- */}
          <div className="space-y-6 lg:col-span-4">
            {/* Widget 1: SALARY RADAR */}
            <section
              id="salary-radar"
              aria-label="Salary radar"
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900/90"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Salary Radar
                </span>
                <span className="font-mono text-xs font-medium text-slate-400">
                  Q2 2026
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimated Market Rate
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
                    $195,000
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    / yr
                  </span>
                </div>
              </div>

              {/* Percentile distribution slider bar */}
              <div className="mt-4 space-y-2">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-[85%] rounded-full bg-slate-950 dark:bg-cyan-400" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>$165k (25th)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    85th Percentile
                  </span>
                  <span>$225k (90th)</span>
                </div>
              </div>

              {/* High Value Skills Breakdown */}
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  High-Value Skills
                </h4>
                <ul className="mt-2.5 space-y-2 text-xs">
                  <li className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>Distributed Systems</span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      +$18k/yr
                    </span>
                  </li>
                  <li className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>Cloud Infrastructure</span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      +$15k/yr
                    </span>
                  </li>
                  <li className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>Rust Optimization</span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      +$12k/yr
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Widget 2: DIRECT INBOUND */}
            <section
              aria-label="Direct inbound recruiter requests"
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900/90"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Direct Inbound
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {inbounds.filter((i) => i.status === "pending").length} New
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
                {inbounds.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
                          {item.senderInitials}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                            {item.senderName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.senderRole}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-950 dark:text-white">
                        {item.compensation}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      &ldquo;{item.message}&rdquo;
                    </p>

                    {item.status === "pending" ? (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptInbound(item.id)}
                          className="flex-1 rounded-lg bg-slate-950 py-1.5 text-center text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineInbound(item.id)}
                          className="flex-1 rounded-lg border border-slate-200/90 bg-white py-1.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Decline
                        </button>
                      </div>
                    ) : item.status === "accepted" ? (
                      <div className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                        <span>Accepted · Recruiter Introduced</span>
                      </div>
                    ) : (
                      <div className="mt-3 text-center text-[11px] font-medium text-slate-400">
                        Declined
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Widget 3: Deterministic SLA Escrow Card */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-slate-900/50">
              <ShieldCheck className="h-5 w-5 shrink-0 text-slate-600 dark:text-cyan-400" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Deterministic 48-Hour SLA Bond active on all conversations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS / DRAWERS
         ========================================================================= */}

      {/* 1. Role Details Modal */}
      {activeModalRole && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveModalRole(null)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold ${activeModalRole.logoBg} ${activeModalRole.logoTextColor ?? "text-white"}`}
              >
                {activeModalRole.logo}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  {activeModalRole.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeModalRole.company} · {activeModalRole.location}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Compensation:
                </span>{" "}
                {activeModalRole.salaryRange} ({activeModalRole.equityOrBonus})
              </div>

              <p>{activeModalRole.description}</p>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Technical Requirements:
                </h4>
                <ul className="mt-1.5 list-disc space-y-1 pl-4">
                  {activeModalRole.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/60 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="font-bold">48-Hour Response SLA:</span> If you
                apply, {activeModalRole.hiringManager} must respond within 48
                hours or Credify locks the company hiring deposit.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalRole(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApplyRole(activeModalRole);
                  setActiveModalRole(null);
                }}
                className="rounded-lg bg-slate-950 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950"
              >
                Apply via ZK-Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Linear Offer Review Modal */}
      {offerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setOfferModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                LN
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Linear — Official Offer Letter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Staff Frontend Architect
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-800/60">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Base Salary:
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  $195,000 / year
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Equity Grant:
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  0.15% (4-year vesting, 1-year cliff)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Offer SLA Deadline:
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  Expires in 23h 48m
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setOfferModalOpen(false);
                  showToast(
                    "Offer accepted! Legal paperwork routed to your email.",
                  );
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Supabase Interview Room Modal */}
      {interviewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Video className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">
              Supabase Architectural Screen
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Scheduled for Tomorrow, 2:00 PM (PT). Host: VP of Eng &amp; Lead
              Architect.
            </p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-300">
              Room security: End-to-end encrypted WebRTC room enabled with
              shared coding environment.
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterviewModalOpen(false);
                  showToast("Calendar invite and room link synced.");
                }}
                className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
