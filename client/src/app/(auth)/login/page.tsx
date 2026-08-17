"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/formErrors";

function roleHome(user: AuthUser): string {
  if (user.role === "candidate") return "/candidate/dashboard";
  if (user.role === "recruiter") return "/recruiter/dashboard";
  return "/";
}

function safeReturnPath(fallback: string): string {
  const requested = new URLSearchParams(window.location.search).get("next");
  return requested?.startsWith("/") && !requested.startsWith("//")
    ? requested
    : fallback;
}

function LoginContent() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  useEffect(() => {
    if (!isLoading && user) {
      const destination = next?.startsWith("/") ? next : roleHome(user);
      router.replace(destination);
    }
  }, [isLoading, router, user, next]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email.trim().toLowerCase(), password);
      router.replace(safeReturnPath(roleHome(loggedInUser)));
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || user) {
    return null;
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to your Credify account."
    >
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email address
          </label>
          <input
            id="login-email"
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
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-orange-700 hover:underline dark:text-orange-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-describedby={error ? "login-error" : undefined}
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
            id="login-error"
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-orange-700 hover:underline dark:text-orange-400"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
