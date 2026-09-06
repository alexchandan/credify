"use client";

import {
  BellRing,
  CheckCircle2,
  DollarSign,
  Lock,
  MessageSquare,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section className="relative border-t border-slate-200/80 bg-slate-50/50 px-5 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
            Platform Capabilities
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Engineered to replace broken job boards
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Every feature in Credify exists to eliminate friction, prevent
            ghosting, and guarantee authentic interactions.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-12">
          {/* Bento Card 1: Verified Credentials (Large 7-col) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl md:col-span-3 lg:col-span-7 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Proof Over Resumes
              </span>
              <span className="font-mono text-xs text-slate-400">
                CRDFY-AUTH-01
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Authentic credentials and verified portfolios
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              No embellished LinkedIn claims or copy-pasted resumes. Profiles on
              Credify are backed by connected code repositories, verified work
              history, and verified company domains.
            </p>

            {/* Interactive Preview Widget */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-950/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Verification Breakdown
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  100% Vetted
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Identity & Corporate Email", status: "Verified" },
                  {
                    label: "GitHub Code Contributions & Repositories",
                    status: "Verified",
                  },
                  {
                    label: "Prior Employment & Reference Confirmation",
                    status: "Verified",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-xs dark:border-white/5 dark:bg-slate-900"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bento Card 2: 100% Salary Transparency (5-col) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl md:col-span-3 lg:col-span-5 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <DollarSign className="h-3.5 w-3.5" />
                Zero Guesswork
              </span>
              <span className="font-mono text-xs text-slate-400">
                PAY-TRANSPARENCY
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Upfront compensation on every role
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              We prohibit listings that omit salary or hide behind ambiguous
              &ldquo;competitive&rdquo; labels. Know base pay, bonus ranges, and
              equity before you invest time.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 text-xs dark:border-emerald-500/20 dark:bg-emerald-950/30">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">
                Role Standard: $165,000 – $210,000 / yr
              </p>
              <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                + 0.15% Equity Grant + Unlimited PTO + 401(k) Match
              </p>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified by hiring
                budget signoff
              </div>
            </div>
          </div>

          {/* Bento Card 3: Real-Time Radar Pipeline (5-col) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl md:col-span-3 lg:col-span-5 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                <Radar className="h-3.5 w-3.5" />
                Live Tracking
              </span>
              <span className="font-mono text-xs text-slate-400">
                PIPELINE-RADAR
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Application Radar: Never get ghosted
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Receive live notifications when a hiring manager opens your
              application, reviews your code samples, or updates your candidate
              status.
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs dark:border-white/5 dark:bg-slate-950/60">
                <BellRing className="h-4 w-4 shrink-0 text-cyan-500" />
                <span className="text-slate-700 dark:text-slate-300">
                  Recruiter reviewed your project portfolio (12m ago)
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3 text-xs dark:border-emerald-500/20 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                  Invited to Technical Architecture Screen
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Direct Recruiter Access (7-col) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl md:col-span-3 lg:col-span-7 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                <MessageSquare className="h-3.5 w-3.5" />
                Direct Communication
              </span>
              <span className="font-mono text-xs text-slate-400">
                NO-ATS-BLACKHOLE
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Direct connection with decision makers
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Skip traditional keyword scanners and robotic third-party
              recruitment agencies. Engage directly with engineering leads and
              internal talent partners who understand technical craft.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    48-Hour Response SLA
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Hiring managers commit to timely feedback on all completed
                  submissions.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Privacy Controls
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Block specific current employers from seeing your profile or
                  availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
