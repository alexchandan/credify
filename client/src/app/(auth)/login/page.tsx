"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSkeleton } from "@/components/ui/skeletons";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/formErrors";
import { ApiError } from "@/lib/apiClient";

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

interface DeletionDetails {
  email: string;
  deletedAt: string;
  scheduledPermanentDeletion: string;
  daysRemaining: number;
}

function LoginPageContent() {
  const router = useRouter();
  const { user, login, recoverAccount } = useAuth();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const isDeactivated = searchParams.get("deactivated") === "true";
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<DeletionDetails | null>(
    null,
  );
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    router.prefetch("/candidate/dashboard");
    router.prefetch("/recruiter/dashboard");
  }, [router]);

  useEffect(() => {
    if (user && !isRedirecting) {
      const destination = next?.startsWith("/") ? next : roleHome(user);
      router.replace(destination);
    }
  }, [router, user, next, isRedirecting]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDeletionInfo(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email.trim().toLowerCase(), password);
      setIsRedirecting(true);
      router.replace(safeReturnPath(roleHome(loggedInUser)));
    } catch (err) {
      setIsSubmitting(false);
      setIsRedirecting(false);
      if (
        err instanceof ApiError &&
        err.code === "ACCOUNT_SCHEDULED_FOR_DELETION"
      ) {
        const details = err.details?.[0] as DeletionDetails | undefined;
        if (details) {
          setDeletionInfo(details);
        } else {
          setError(err.message);
        }
      } else {
        setError(getErrorMessage(err));
      }
    }
  }

  async function handleRecoverAccount() {
    if (!email || !password) {
      setError("Please enter your email and password to recover your account.");
      return;
    }
    setError(null);
    setIsRecovering(true);

    try {
      const recoveredUser = await recoverAccount(
        email.trim().toLowerCase(),
        password,
      );
      setRecoverySuccess(true);
      setDeletionInfo(null);
      setIsRedirecting(true);
      setTimeout(() => {
        router.replace(safeReturnPath(roleHome(recoveredUser)));
      }, 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsRecovering(false);
    }
  }

  if (user && !isRedirecting) {
    return <AuthSkeleton />;
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to your Credify account."
    >
      {isDeactivated && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Account Deactivated
            </p>
          </div>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Your account is scheduled for permanent deletion in 7 days. You can
            sign in below anytime within the 7-day grace period to recover your
            account.
          </p>
        </div>
      )}

      {recoverySuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium">
            Account successfully recovered! Welcome back. Redirecting...
          </p>
        </div>
      )}

      {deletionInfo && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                Account Scheduled for Deletion
              </h3>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                This account is currently deactivated and scheduled for
                permanent deletion on{" "}
                <strong>
                  {new Date(
                    deletionInfo.scheduledPermanentDeletion,
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>{" "}
                ({deletionInfo.daysRemaining} day
                {deletionInfo.daysRemaining === 1 ? "" : "s"} remaining in your
                recovery window).
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRecoverAccount}
                  disabled={isRecovering}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {isRecovering
                    ? "Recovering Account..."
                    : "Recover Account Now"}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Instantly reactivate your account and restore your profile.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
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
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:text-white dark:focus:ring-cyan-500/30"
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
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:text-white dark:focus:ring-cyan-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
            className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isRecovering || isRedirecting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:from-cyan-500 dark:via-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:shadow-cyan-500/25 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
        >
          {isRedirecting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Redirecting to workspace...
            </>
          ) : isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
