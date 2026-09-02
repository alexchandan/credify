import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 items-center px-5 py-10 sm:px-6 sm:py-14">
      <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
        <Link
          href="/"
          aria-label="Go to Credify home"
          className="group mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100/80 bg-cyan-50/70 shadow-sm transition hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/10 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:hover:border-cyan-700"
        >
          <Logo
            size={38}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </Link>
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}
