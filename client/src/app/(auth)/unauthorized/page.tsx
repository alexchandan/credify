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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline dark:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return home
        </Link>
      </div>
    </AuthShell>
  );
}
