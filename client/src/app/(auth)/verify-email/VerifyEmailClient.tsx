"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";

type Status = "pending" | "success" | "error";

const verificationRequests = new Map<string, Promise<void>>();

function verifyEmailToken(token: string): Promise<void> {
  const existingRequest = verificationRequests.get(token);
  if (existingRequest) return existingRequest;

  const request = apiRequest("/auth/verify-email", {
    method: "POST",
    body: { token },
    skipAuth: true,
  }).then(() => undefined);

  verificationRequests.set(token, request);
  void request.catch(() => {
    if (verificationRequests.get(token) === request) {
      verificationRequests.delete(token);
    }
  });
  return request;
}

export default function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>(token ? "pending" : "error");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token
      ? null
      : "No verification token was found. Use the link from your email.",
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    async function verify() {
      try {
        await verifyEmailToken(token);
        if (active) setStatus("success");
      } catch (error) {
        if (active) {
          setStatus("error");
          setErrorMessage(getErrorMessage(error));
        }
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [token]);

  if (status === "pending") {
    return (
      <AuthShell
        title="Verifying your email"
        description="We are confirming your verification link."
      >
        <div className="mt-7 text-center" role="status" aria-live="polite">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/80 bg-cyan-50/90 text-cyan-700 shadow-xs dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
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
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99]"
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
      description={errorMessage ?? "This verification link could not be used."}
    >
      <div className="mt-7 text-center" role="alert">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <XCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Need a new link?{" "}
          <Link
            href="/register"
            className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Register again
          </Link>{" "}
          or check your inbox for a resend option.
        </p>
      </div>
    </AuthShell>
  );
}
