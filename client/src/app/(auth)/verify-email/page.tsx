"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          <XCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">
          <span>Need a new link? </span>
          <Link
            href="/register"
            className="font-semibold text-orange-700 hover:underline"
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
              className="h-5 w-5 animate-spin text-orange-700"
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
