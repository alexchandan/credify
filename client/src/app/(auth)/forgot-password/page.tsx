"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { API_BASE_URL as API_BASE } from "@/lib/apiBaseUrl";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
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
          ? "If an account with that email exists (active or within the 7-day recovery period), we sent a password reset link."
          : "Enter your account email and we will send you a secure reset link."
      }
    >
      {submitted ? (
        <div className="mt-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/80 bg-cyan-50/90 text-cyan-700 shadow-xs dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
            <Mail className="h-6 w-6" aria-hidden="true" />
          </div>
          <Link
            href="/login"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
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
                  className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-10 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:text-white dark:focus:ring-cyan-500/30"
                />
              </div>
            </div>

            {error && (
              <p
                id="forgot-password-error"
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:from-cyan-500 dark:via-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:shadow-cyan-500/25 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
