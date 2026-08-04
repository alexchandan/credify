"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

type Status = "pending" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token
      ? null
      : "No verification token found in the URL. Use the link from your email.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-email`, {
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

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      {status === "pending" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Loader2
              className="h-7 w-7 animate-spin text-blue-700"
              strokeWidth={2}
            />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Verifying your email...
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This will just take a moment.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              className="h-7 w-7 text-emerald-600"
              strokeWidth={2}
            />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Email verified
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account is ready. You can now log in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Go to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-7 w-7 text-red-600" strokeWidth={2} />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Verification failed
          </h1>
          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          <p className="mt-4 text-sm text-slate-500">
            Need a new link?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-700 hover:underline"
            >
              Register again
            </Link>{" "}
            or check your inbox for a resend option.
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-slate-900"
          >
            <ShieldCheck
              className="hidden h-5 w-5 sm:block"
              strokeWidth={2.25}
            />
            Credify
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign In
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <Suspense
          fallback={
            <p className="text-center text-sm text-slate-500">Loading...</p>
          }
        >
          <VerifyEmailInner />
        </Suspense>
      </div>
    </div>
  );
}
