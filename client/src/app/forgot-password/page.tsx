"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-slate-900"
          >
            Credify
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <Mail className="h-6 w-6 text-blue-700" strokeWidth={2} />
              </div>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                If an account with that email exists, we&apos;ve sent a link to
                reset your password.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <KeyRound className="h-6 w-6 text-blue-700" strokeWidth={2} />
              </div>
              <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
                Reset your password
              </h1>
              <p className="mt-2 text-center text-sm text-slate-500">
                Enter the email address associated with your account and
                we&apos;ll send you a link to reset your password.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-10 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <Link
                href="/login"
                className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
