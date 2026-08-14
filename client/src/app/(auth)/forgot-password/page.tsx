"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(
          json.error?.message ?? "Something went wrong. Please try again.",
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={submitted ? "Check your email" : "Reset your password"}
      description={
        submitted
          ? "If an account with that email exists, we sent a password reset link."
          : "Enter your account email and we will send you a secure reset link."
      }
    >
      {submitted ? (
        <div className="mt-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline dark:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            <div>
              <label
                htmlFor="forgot-password-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                  autoFocus
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "forgot-password-error" : undefined}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-10 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
                />
              </div>
            </div>

            {error && (
              <p
                id="forgot-password-error"
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline dark:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </>
      )}
    </AuthShell>
  );
}
