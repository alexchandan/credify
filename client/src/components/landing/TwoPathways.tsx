"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, Check, User } from "lucide-react";

export function TwoPathways() {
  return (
    <section
      aria-label="Two pathways, one verified platform"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-cyan-500/25 bg-cyan-50 px-3.5 py-1 text-xs font-bold tracking-wider text-cyan-700 uppercase dark:border-cyan-500/30 dark:bg-cyan-950/60 dark:text-cyan-300">
            TWO-SIDED ECOSYSTEM
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Two pathways, one verified platform.
          </h2>
          <p className="mt-3.5 text-base text-slate-600 dark:text-slate-300">
            Choose your funnel to experience seamless talent matching with
            cryptographic trust.
          </p>
        </div>

        {/* Two Pathway Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card 1: For Candidates */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-sky-100 bg-linear-to-b from-sky-50/70 via-sky-50/20 to-white p-8 shadow-xs transition hover:border-sky-200 sm:p-10 dark:border-sky-900/40 dark:from-sky-950/20 dark:via-slate-900/50 dark:to-slate-900">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/90 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                <User className="h-3.5 w-3.5" />
                <span>FOR CANDIDATES</span>
              </div>

              {/* Title */}
              <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                Let top companies reach out to you with verified offers.
              </h3>

              {/* Subtitle */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Stop blasting 200 resumes into silence. Build a verified profile
                once, prove your skills with code and peer attestations, and
                receive upfront salary invitations.
              </p>

              {/* Checklist */}
              <div className="mt-7 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-950 dark:text-white">
                      Verified credentials:
                    </strong>{" "}
                    Showcase cryptographic proof of your GitHub PRs, system
                    design, and verified past roles.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-950 dark:text-white">
                      1-click apply:
                    </strong>{" "}
                    Skip cumbersome 5-page ATS questionnaires with your
                    universal verified credential.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-950 dark:text-white">
                      Live pipeline radar:
                    </strong>{" "}
                    Real-time tracking of which engineering directors review
                    your application.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center dark:border-white/5">
              <Link
                href="/register?role=candidate"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-600/25 transition hover:bg-cyan-500 active:scale-[0.98]"
              >
                <span>Create Candidate Profile</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Free for all job seekers • 100% confidential
              </span>
            </div>
          </div>

          {/* Card 2: For Hiring Teams */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-emerald-100 bg-linear-to-b from-emerald-50/70 via-emerald-50/20 to-white p-8 shadow-xs transition hover:border-emerald-200 sm:p-10 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-slate-900/50 dark:to-slate-900">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Building2 className="h-3.5 w-3.5" />
                <span>FOR HIRING TEAMS</span>
              </div>

              {/* Title */}
              <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                Hire pre-vetted engineers without sifting through resume spam.
              </h3>

              {/* Subtitle */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Eliminate candidate fraud and AI-generated spam resumes. Access
                senior and principal talent with benchmarked technical
                competence and confirmed compensation matches.
              </p>

              {/* Checklist */}
              <div className="mt-7 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-950 dark:text-white">
                      Code-verified portfolios:
                    </strong>{" "}
                    Review genuine commit history, algorithmic benchmarks, and
                    architecture audits.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-950 dark:text-white">
                      48h interview scheduling:
                    </strong>{" "}
                    Engage high-intent active candidates within hours, not
                    weeks.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-950 dark:text-white">
                      Zero recruiter agency fees:
                    </strong>{" "}
                    Transparent SaaS subscription without punitive 25% placement
                    markups.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center dark:border-white/5">
              <Link
                href="/register?role=recruiter"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-xs transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                <span>Post a Role</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Integrates with Greenhouse, Lever, Ashby
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
