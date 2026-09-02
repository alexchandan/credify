import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function UnauthorizedPage() {
  return (
    <AuthShell
      title="Access restricted"
      description="Your account does not have permission to view this page."
    >
      <div className="mt-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <Link
          href="/"
          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Return home
        </Link>
      </div>
    </AuthShell>
  );
}
