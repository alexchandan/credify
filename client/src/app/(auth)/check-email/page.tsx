"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink, Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { API_BASE_URL as API_BASE } from "@/lib/apiBaseUrl";

const RESEND_COOLDOWN_SECONDS = 30;

function getCooldownKey(email: string): string {
  const normalized = email.trim().toLowerCase();
  return normalized
    ? `credify_resend_cooldown_${normalized}`
    : "credify_resend_cooldown";
}

function webmailUrlFor(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("gmail")) return "https://mail.google.com/";
  if (
    domain.includes("outlook") ||
    domain.includes("hotmail") ||
    domain.includes("live")
  ) {
    return "https://outlook.live.com/mail/";
  }
  if (domain.includes("yahoo")) return "https://mail.yahoo.com/";
  return `mailto:${email}`;
}

function CheckEmailInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const storageKey = getCooldownKey(email);
    const timerId = setTimeout(() => {
      const savedExpiry = sessionStorage.getItem(storageKey);
      if (savedExpiry) {
        const remainingMs = Number(savedExpiry) - Date.now();
        const remainingSec = Math.ceil(remainingMs / 1000);
        if (remainingSec > 0 && remainingSec <= RESEND_COOLDOWN_SECONDS) {
          setCountdown(remainingSec);
        } else {
          sessionStorage.removeItem(storageKey);
        }
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) return;

    const storageKey = getCooldownKey(email);
    const timer = setInterval(() => {
      const savedExpiry = sessionStorage.getItem(storageKey);
      if (savedExpiry) {
        const remaining = Math.ceil((Number(savedExpiry) - Date.now()) / 1000);
        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          sessionStorage.removeItem(storageKey);
          setCountdown(0);
        }
      } else {
        setCountdown((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, email]);

  async function handleResend() {
    if (!email || isResending || countdown > 0) return;
    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setResendMessage("A new verification link has been sent.");
        setCountdown(RESEND_COOLDOWN_SECONDS);
        sessionStorage.setItem(
          getCooldownKey(email),
          String(Date.now() + RESEND_COOLDOWN_SECONDS * 1000),
        );
      } else {
        setResendMessage(
          json.error?.message ?? "Something went wrong. Please try again.",
        );
        if (res.status === 429 || json.error?.code === "RATE_LIMITED") {
          setCountdown(RESEND_COOLDOWN_SECONDS);
          sessionStorage.setItem(
            getCooldownKey(email),
            String(Date.now() + RESEND_COOLDOWN_SECONDS * 1000),
          );
        }
      }
    } catch {
      setResendMessage("Could not reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      title="Check your inbox"
      description="Use the verification link we sent to confirm your account."
    >
      <div className="mt-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100/80 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Mail className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Sent to{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {email || "your email address"}
          </span>
        </p>

        {email ? (
          <a
            href={webmailUrlFor(email)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-[0.99]"
          >
            Open email app
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300">
            No email address was provided. Register again to request a new link.
          </p>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || countdown > 0 || !email}
          aria-disabled={isResending || countdown > 0 || !email}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
        >
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : countdown > 0 ? (
            <>
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Resend link in {countdown}s</span>
            </>
          ) : (
            <span>Resend verification link</span>
          )}
        </button>
        {resendMessage && (
          <p
            className="mt-3 text-sm text-slate-600 dark:text-slate-300"
            aria-live="polite"
          >
            {resendMessage}
          </p>
        )}

        <Link
          href="/login"
          className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to sign in
        </Link>
        <p className="mt-6 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Can&apos;t find the email? Check your spam folder.
        </p>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Loading your email details"
          description="This will only take a moment."
        >
          <p
            className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400"
            role="status"
          >
            Loading...
          </p>
        </AuthShell>
      }
    >
      <CheckEmailInner />
    </Suspense>
  );
}
