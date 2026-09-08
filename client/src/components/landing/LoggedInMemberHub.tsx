"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import type { AuthUser } from "@/context/AuthContext";

interface LoggedInMemberHubProps {
  user: AuthUser;
}

export function LoggedInMemberHub({ user }: LoggedInMemberHubProps) {
  const isCandidate = user.role === "candidate";
  const isRecruiter = user.role === "recruiter";
  const isAdmin = user.role === "admin";

  const displayName = user.fullName?.trim() || user.email.split("@")[0];
  const isVerified = Boolean(user.isVerified);

  return (
    <section
      aria-label="Member Command Center"
      className="relative overflow-hidden border-t border-slate-200/80 bg-linear-to-b from-slate-50/70 via-white to-slate-50/70 px-5 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-white/5 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/60"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 h-120 w-220 -translate-x-1/2 rounded-full bg-linear-to-tr from-cyan-500/10 via-emerald-500/5 to-sky-500/10 blur-3xl dark:from-cyan-500/15 dark:via-emerald-500/10 dark:to-sky-500/15" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Welcome & Member Status Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:p-8 lg:p-10 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-500/40 dark:bg-cyan-950/70 dark:text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Member Command Center</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                  <User className="h-3 w-3" />
                  <span className="capitalize">
                    {isAdmin
                      ? "System Admin"
                      : isRecruiter
                        ? "Hiring Partner"
                        : "Candidate"}
                  </span>
                </span>

                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Identity
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/60 dark:text-amber-300">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Verification Pending
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
                Welcome back,{" "}
                <span className="bg-linear-to-r from-cyan-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-cyan-300 dark:to-emerald-400">
                  {displayName}
                </span>
              </h2>

              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                {isRecruiter
                  ? "Manage verified openings, review authenticated engineering talent with real GitHub proof, and track your 48-hour candidate response SLA."
                  : isCandidate
                    ? "Keep your verified code proof up to date, track your application milestones in real time, and explore transparent opportunities."
                    : "Access platform administration, oversee verified job distributions, and inspect hiring activity."}
              </p>
            </div>

            {/* Quick Workspace Switcher Button */}
            <div className="shrink-0">
              <Link
                href={
                  isAdmin
                    ? "/candidate/dashboard"
                    : isRecruiter
                      ? "/recruiter/dashboard"
                      : "/candidate/dashboard"
                }
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-cyan-600 to-cyan-700 px-6 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 transition-all hover:from-cyan-500 hover:to-cyan-600 hover:shadow-cyan-600/35 active:scale-[0.98] sm:w-auto dark:from-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Your Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROLE-SPECIFIC WORKSPACE CARDS */}
        {isCandidate && (
          <div className="mt-10 space-y-10">
            {/* 4 Action Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Application Radar */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 dark:border-sky-900/40 dark:bg-sky-950/60 dark:text-sky-400">
                      <Radar className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                      48h SLA Protected
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Application Radar
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Track your active submissions live through Review, Technical
                    Screen, and Offer. Hiring teams commit to strict response
                    deadlines.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/candidate/applications"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>View application pipeline</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Verified Craft & Code Proof */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-900/40 dark:bg-cyan-950/60 dark:text-cyan-400">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                      Proof Over Resumes
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Verified Craft & Skills
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Keep your connected GitHub repositories, project code, and
                    skills updated. Verified work puts you at the top of inbound
                    recruiter searches.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/candidate/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>Manage verified profile</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Upfront Job Discovery */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      100% Salary Listed
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Verified Job Search
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Explore active openings with verified corporate email
                    domains, clear salary ranges, and zero ghost listings.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>Browse all opportunities</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Card 4: Compensation Benchmark Tool (Anchor Jump) */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/40 dark:bg-purple-950/60 dark:text-purple-400">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      Market Intelligence
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Salary Benchmark Tool
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Compare offers against real compensation bands across
                    seniority tiers before entering negotiation.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <a
                    href="#salary-explorer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>Explore role salary data</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Candidate Playbook Banner */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-100/60 p-6 sm:p-8 dark:border-white/5 dark:bg-slate-900/50">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Candidate Playbook
                  </span>
                  <h3 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                    Three ways to stand out on Credify
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/candidate/profile"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:border-cyan-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Connect Repositories</span>
                  </Link>
                  <Link
                    href="/candidate/applications"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:border-cyan-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40"
                  >
                    <Clock className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Check Radar Status</span>
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/5 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>1. Real Code Verification</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Profiles with attached repositories receive 4.2x higher
                    response rates from technical hiring managers.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/5 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>2. Define Salary Floor</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Set your minimum expected compensation to ensure only
                    well-budgeted roles reach your inbox.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/5 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>3. 48h Response SLA</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Recruiters are held to strict response windows so you are
                    never left in application limbo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECRUITER-SPECIFIC WORKSPACE CARDS */}
        {isRecruiter && (
          <div className="mt-10 space-y-10">
            {/* 4 Action Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Post New Job */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-900/40 dark:bg-cyan-950/60 dark:text-cyan-400">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                      Fast Distribution
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Publish Verified Role
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Create openings with upfront compensation bands and tech
                    criteria to attract pre-vetted engineers.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/recruiter/jobs/new"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>Post a new role</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Manage Jobs & Pipeline */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/40 dark:bg-purple-950/60 dark:text-purple-400">
                      <Layers className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      Zero Spam Inbound
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Manage Active Roles
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Review candidate submissions with attached code proof,
                    repository metrics, and verified credentials.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/recruiter/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>View all openings</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Company Profile */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Verified Employer
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Company Brand
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Showcase engineering culture, tech stacks, and verified
                    domain to stand out to senior technical leaders.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/recruiter/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>Edit company profile</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Card 4: Recruiter Analytics */}
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/60 dark:text-amber-400">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      SLA Health
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    Hiring SLA & Metrics
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Monitor candidate response times, SLA compliance, and
                    conversion metrics across active postings.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                  <Link
                    href="/recruiter/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    <span>Open hiring dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recruiter Playbook Banner */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-100/60 p-6 sm:p-8 dark:border-white/5 dark:bg-slate-900/50">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Hiring Partner Principles
                  </span>
                  <h3 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                    Maximizing conversion with verified talent
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/recruiter/jobs/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Create Position</span>
                  </Link>
                  <Link
                    href="/recruiter/jobs"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:border-cyan-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40"
                  >
                    <Layers className="h-3.5 w-3.5 text-purple-500" />
                    <span>Manage Pipeline</span>
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/5 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>1. Upfront Pay Ranges</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Listings with clear salary bands attract 3.2x more senior
                    engineering applicants than vague postings.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/5 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>2. Code-First Review</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Evaluate verified candidate repositories and projects first
                    to skip resume buzzwords and save screen time.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/5 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>3. 48h Response Commitment</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Fast recruiter feedback increases offer acceptance by 40%
                    and maintains high company reputation rankings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {isAdmin && (
          <div className="mt-10 rounded-3xl border border-slate-200/90 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
              Administrator Controls Active
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
              You are signed in with system administration privileges. Access
              system monitoring and verify partner companies.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/recruiter/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <span>Hiring Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/candidate/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 transition hover:border-cyan-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                <span>Candidate Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
