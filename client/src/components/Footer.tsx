import Link from "next/link";
import { Logo } from "@/components/Logo";

const PLATFORM_LINKS = [
  { href: "/jobs", label: "Browse jobs" },
  { href: "/candidate/dashboard", label: "Candidate dashboard" },
  { href: "/candidate/applications", label: "My applications" },
  { href: "/candidate/profile", label: "Candidate profile" },
];

const EMPLOYER_LINKS = [
  { href: "/recruiter/dashboard", label: "Recruiter dashboard" },
  { href: "/recruiter/candidates", label: "Find talent" },
  { href: "/recruiter/jobs", label: "Manage jobs" },
  { href: "/recruiter/jobs/new", label: "Post a job" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/register?role=candidate", label: "Join as a candidate" },
  { href: "/register?role=recruiter", label: "Join as an employer" },
];

function FooterLinks({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <ul className="mt-4 space-y-2.5 text-xs">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="transition-colors hover:text-white">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070e17] text-slate-400 dark:border-white/10 dark:bg-[#060c14]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-xl font-black tracking-tight text-white"
            >
              <Logo size={24} />
              <span>Credify</span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              Discover active opportunities with transparent salary ranges,
              manage applications, and connect candidates with hiring teams.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live jobs are loaded from the Credify API</span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold tracking-wider text-white uppercase">
              Platform
            </h2>
            <FooterLinks links={PLATFORM_LINKS} />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wider text-white uppercase">
              For employers
            </h2>
            <FooterLinks links={EMPLOYER_LINKS} />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wider text-white uppercase">
              Account
            </h2>
            <FooterLinks links={ACCOUNT_LINKS} />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row dark:border-white/10">
          <p>© 2026 Credify. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link
              href="/jobs"
              className="transition-colors hover:text-slate-300"
            >
              Jobs
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-slate-300"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="transition-colors hover:text-slate-300"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
