"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { API_BASE_URL as API_BASE } from "@/lib/apiBaseUrl";

type Status = "pending" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(API_BASE + "/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (cancelled) return;

        if (!json.success) {
          setStatus("error");
          setErrorMessage(
            json.error?.message ?? "This link is invalid or has expired.",
          );
          return;
        }

        setStatus("success");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Could not reach the server. Please try again.");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (token && status === "pending") {
    return (
      <AuthShell
        title="Verifying your email"
        description="We are confirming your verification link."
      >
        <div className="mt-7 text-center" role="status" aria-live="polite">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100/80 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            This will only take a moment.
          </p>
        </div>
      </AuthShell>
    );
  }

  if (status === "success") {
    return (
      <AuthShell
        title="Email verified"
        description="Your account is ready. You can now sign in to Credify."
      >
        <div className="mt-7 text-center" role="status">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-600 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-linear-to-r from-indigo-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-[0.99]"
          >
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verification failed"
      description={
        errorMessage ??
        (token
          ? "This verification link could not be used."
          : "No verification token was found. Use the link from your email.")
      }
    >
      <div className="mt-7 text-center" role="alert">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <XCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <span>Need a new link? </span>
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Register again
          </Link>
          <span> or check your inbox for a resend option.</span>
        </p>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Verifying your email"
          description="We are confirming your verification link."
        >
          <div className="mt-7 flex justify-center" role="status">
            <Loader2
              className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400"
              aria-label="Loading"
            />
          </div>
        </AuthShell>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
