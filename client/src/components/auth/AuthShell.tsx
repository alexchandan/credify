import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import logo from "@/../public/logo.png";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 items-center px-5 py-10 sm:px-6 sm:py-14">
      <div className="relative w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-950">
        <Link
          href="/"
          aria-label="Go to Credify home"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-orange-200 bg-orange-50 transition hover:border-orange-300 dark:border-orange-800 dark:bg-orange-950/40 dark:hover:border-orange-600"
        >
          <Image
            src={logo}
            alt=""
            className="h-12 w-12 object-contain"
            priority
          />
        </Link>
        <h1 className="text-center text-2xl font-bold text-slate-950 dark:text-white">
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
