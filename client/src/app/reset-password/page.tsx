"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "No reset token found in the URL. Use the link from your email.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(
          json.error?.message ?? "Something went wrong. Please try again.",
        );
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {success ? (
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">Password reset</h1>
          <p className="mt-2 text-sm text-slate-500">
            Redirecting you to log in...
          </p>
        </div>
      ) : (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Lock className="h-6 w-6 text-blue-700" strokeWidth={2} />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
            Create new password
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Your new password must be different from previously used passwords.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={15}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Must be 6–15 characters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={15}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900">
            Credify
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Register
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <Suspense
          fallback={
            <p className="text-center text-sm text-slate-500">Loading...</p>
          }
        >
          <ResetPasswordInner />
        </Suspense>
      </div>
    </div>
  );
}
