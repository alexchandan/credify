"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

type JourneyType = "candidates" | "employers";

export function HowItWorks() {
  const [journey, setJourney] = useState<JourneyType>("candidates");

  return (
    <section className="relative px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
            Streamlined & Transparent
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            How Credify simplifies the hiring journey
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-300">
            A frictionless platform built for high-trust hiring. Select your
            perspective to see how it works.
          </p>

          {/* Perspective Switcher */}
          <div className="mt-8 inline-flex rounded-2xl border border-slate-200/90 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setJourney("candidates")}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                journey === "candidates"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              For Candidates & Job Seekers
            </button>
            <button
              type="button"
              onClick={() => setJourney("employers")}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                journey === "employers"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              For Employers & Hiring Teams
            </button>
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {journey === "candidates" ? (
            <>
              {/* Candidate Step 1 */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    01
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  Build Your Verified Profile
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Connect your real portfolio, GitHub repositories, and verified
                  credentials. Eliminate resume embellishment and show tangible
                  proof of your technical craft.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    One profile for hundreds of verified openings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Privacy options: browse actively or stealthily
                  </li>
                </ul>
              </div>

              {/* Candidate Step 2 */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    02
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  Apply With 100% Transparency
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  View complete salary bands, remote expectations, and tech
                  stacks before submitting. Zero ghost jobs—every posting is
                  active and tied to verified hiring budgets.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Exact compensation posted upfront
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    1-click application with verified credentials
                  </li>
                </ul>
              </div>

              {/* Candidate Step 3 */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    03
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 dark:border-sky-900/40 dark:bg-sky-950/50 dark:text-sky-400">
                    <Gauge className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  Track Milestones in Real Time
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Follow your application status live through review, technical
                  screen, and final offer. Recruiters are held to strict
                  response windows so you never get ghosted.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Instant notification on recruiter review
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Guaranteed status updates within 48-72h
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Employer Step 1 */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    01
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  Publish Verified Openings
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Create roles with transparent compensation and specific tech
                  requirements. Showcase company culture, engineering values,
                  and your team’s verified status.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Instant company verification badge
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    High visibility among qualified engineers
                  </li>
                </ul>
              </div>

              {/* Employer Step 2 */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    02
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/40 dark:bg-purple-950/50 dark:text-purple-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  Review Authenticated Talent
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Skip spam applications and generic AI-generated resumes.
                  Receive candidates whose skills, project links, and experience
                  are verified by real proof.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Algorithmic match score on key skills
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Direct portfolio & project verification
                  </li>
                </ul>
              </div>

              {/* Employer Step 3 */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    03
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  Close Hires in Record Time
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Move top engineers through streamlined interview stages with
                  built-in pipeline tools. Reduce average hiring time from 45
                  days down to under two weeks.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    Built-in candidate pipeline & notes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    High offer acceptance rate
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* CTA Banner inside How It Works */}
        <div className="mt-12 text-center">
          <Link
            href={
              journey === "candidates"
                ? "/register?role=candidate"
                : "/register?role=recruiter"
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            <span>
              {journey === "candidates"
                ? "Create your candidate profile"
                : "Start hiring verified talent"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
