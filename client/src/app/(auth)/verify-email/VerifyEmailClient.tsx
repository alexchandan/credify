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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <XCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Need a new link?{" "}
          <Link
            href="/register"
            className="font-semibold text-orange-700 hover:underline dark:text-orange-400"
          >
            Register again
          </Link>{" "}
          or check your inbox for a resend option.
        </p>
      </div>
    </AuthShell>
  );
}
