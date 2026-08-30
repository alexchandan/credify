"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/formErrors";

function roleHome(user: AuthUser): string {
  if (user.role === "candidate") return "/candidate/dashboard";
  if (user.role === "recruiter") return "/recruiter/dashboard";
  return "/";
}

export default function RecoverAccountPage() {
  const router = useRouter();
  const { recoverAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recovered, setRecovered] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await recoverAccount(email.trim().toLowerCase(), password);
      setRecovered(true);
      setTimeout(() => {
        router.replace(roleHome(user));
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={recovered ? "Account Recovered!" : "Recover Your Account"}
      description={
        recovered
          ? "Your account and profile have been successfully restored."
          : "Deactivated your account in the last 7 days? Enter your credentials to reactivate it."
      }
    >
      {recovered ? (
        <div className="mt-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
            Welcome back! Redirecting you to your dashboard...
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              7-Day Grace Period Recovery
            </div>
            <p className="mt-1 text-emerald-800 dark:text-emerald-300">
              Recovering your account cancels the scheduled permanent deletion
              and immediately restores your profile, preferences, and activity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div>
              <label
                htmlFor="recover-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Email address
              </label>
              <input
                id="recover-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                autoCapitalize="none"
                required
                autoFocus
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
              />
            </div>

            <div>
              <label
                htmlFor="recover-password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="recover-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-describedby={error ? "recover-error" : undefined}
                  aria-invalid={Boolean(error)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                id="recover-error"
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              {isSubmitting ? "Recovering Account..." : "Recover Account"}
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
