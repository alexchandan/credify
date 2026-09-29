"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070e17] text-slate-400 dark:border-white/10 dark:bg-[#060c14]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & SLA Status */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-xl font-black tracking-tight text-white"
            >
              <Logo size={24} />
              <span>Credify</span>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              The high-trust verifiable talent exchange. Built for ambitious
              software engineers and engineering-driven companies demanding
              salary transparency and zero ghost listings.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>All 10,000+ verification nodes online · 99.95% SLA</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/jobs"
                  className="transition-colors hover:text-white"
                >
                  Browse Tech Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/candidate/profile"
                  className="transition-colors hover:text-white"
                >
                  ZK-Credential Proofs
                </Link>
              </li>
              <li>
                <a
                  href="#salary-radar"
                  className="transition-colors hover:text-white"
                >
                  Salary Radar 2026
                </a>
              </li>
              <li>
                <Link
                  href="/candidate/applications"
                  className="transition-colors hover:text-white"
                >
                  Interview SLA Escrow
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="transition-colors hover:text-white"
                >
                  Engineering Benchmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Employers */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              For Employers
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/recruiter/candidates"
                  className="transition-colors hover:text-white"
                >
                  Direct Talent Sourcing
                </Link>
              </li>
              <li>
                <Link
                  href="/recruiter/jobs"
                  className="transition-colors hover:text-white"
                >
                  ATS Verification Sync
                </Link>
              </li>
              <li>
                <Link
                  href="/recruiter/dashboard"
                  className="transition-colors hover:text-white"
                >
                  48-Hour Response SLA
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="transition-colors hover:text-white"
                >
                  Enterprise Security
                </Link>
              </li>
              <li>
                <Link
                  href="/register?role=recruiter"
                  className="transition-colors hover:text-white"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Transparency */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Transparency
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/anti-ghost"
                  className="transition-colors hover:text-white"
                >
                  Anti-Ghost Covenant
                </Link>
              </li>
              <li>
                <Link
                  href="/verification-feed"
                  className="transition-colors hover:text-white"
                >
                  Live Verification Feed
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
                  Privacy &amp; Data Ethics
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-white"
                >
                  Terms of Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/security-whitepaper"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Security Whitepaper</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & certifications */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row dark:border-white/10">
          <p>
            © 2026 Credify Inc. All rights reserved. Instahyre-grade hiring
            architecture.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-slate-400"
            >
              Terms of Service
            </Link>
            <Link
              href="/security"
              className="transition-colors hover:text-slate-400"
            >
              Security Overview
            </Link>
            <span className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 text-[11px] font-medium text-slate-400">
              SOC2 Type II Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
