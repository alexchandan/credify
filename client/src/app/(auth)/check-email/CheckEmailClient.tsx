"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";

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

export default function CheckEmailClient({ email }: { email: string }) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: { email },
        skipAuth: true,
      });
      setResendMessage("A new verification link has been sent.");
    } catch (error) {
      setResendMessage(getErrorMessage(error));
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/80 bg-cyan-50/90 text-cyan-700 shadow-xs dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
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
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99]"
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
          disabled={isResending || !email}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-600 dark:hover:text-cyan-400"
        >
          {isResending ? "Sending..." : "Resend verification link"}
        </button>

        {resendMessage ? (
          <p
            className="mt-3 text-sm text-slate-600 dark:text-slate-300"
            aria-live="polite"
          >
            {resendMessage}
          </p>
        ) : null}

        <Link
          href="/login"
          className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
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
