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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Sent to{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {email || "your email address"}
          </span>
        </p>

        {email ? (
          <a
            href={webmailUrlFor(email)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Open email app
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <p className="mt-5 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
            No email address was provided. Register again to request a new link.
          </p>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !email}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-orange-300 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/40"
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
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline dark:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
        <p className="mt-6 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Can&apos;t find the email? Check your spam folder.
        </p>
      </div>
    </AuthShell>
  );
}
