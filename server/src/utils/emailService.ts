// src/utils/emailService.ts
import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

/**
 * Wraps the actual email provider (Resend today) behind an interface,
 * same reasoning as storageService.ts for Cloudinary: swapping providers
 * later, or mocking email in tests, means implementing this interface
 * once, not hunting down every call site that touched the Resend SDK
 * directly.
 */
export interface EmailService {
  sendVerificationEmail(to: string, verificationUrl: string): Promise<void>;
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

const resend = new Resend(env.email.resendApiKey);

function baseEmailLayout(
  title: string,
  bodyHtml: string,
  ctaLabel: string,
  ctaUrl: string,
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 20px; color: #0f172a; margin-bottom: 16px;">${title}</h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">${bodyHtml}</p>
      <a href="${ctaUrl}" style="display: inline-block; margin-top: 20px; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
        ${ctaLabel}
      </a>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="word-break: break-all;">${ctaUrl}</span>
      </p>
    </div>
  `;
}

class ResendEmailService implements EmailService {
  async sendVerificationEmail(
    to: string,
    verificationUrl: string,
  ): Promise<void> {
    const { error } = await resend.emails.send({
      from: env.email.from,
      to,
      subject: "Verify your Credify account",
      html: baseEmailLayout(
        "Confirm your email",
        "Welcome to Credify — click the button below to verify your email and activate your account. This link expires in 24 hours.",
        "Verify Email",
        verificationUrl,
      ),
    });
    // Resend's SDK does NOT reject the promise on an API-level failure
    // (e.g. "you can only send to your own email until you verify a
    // domain") — it resolves normally with { data: null, error }.
    // Without this check, sendEmailSafely()'s try/catch would never see
    // these failures at all, and they'd be silently invisible.
    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const { error } = await resend.emails.send({
      from: env.email.from,
      to,
      subject: "Reset your Credify password",
      html: baseEmailLayout(
        "Reset your password",
        "We received a request to reset your password. If this wasn't you, you can safely ignore this email. This link expires in 1 hour.",
        "Reset Password",
        resetUrl,
      ),
    });
    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }
  }
}

const realEmailService = new ResendEmailService();

/**
 * Sends an email WITHOUT letting a failure break whatever action
 * triggered it (registration, password reset request, etc.). Email
 * delivery is inherently less reliable than your own database — a
 * flaky provider or a bad API key should never prevent someone from
 * successfully registering. Errors are logged, not thrown.
 *
 * NOTE: this is a direct, awaited send — not queued. Fine for current
 * volume; a real background job queue (BullMQ + Redis, already planned
 * for Phase 4 hardening) is the correct upgrade once email volume or
 * request-latency sensitivity actually requires it.
 */
export async function sendEmailSafely(
  send: () => Promise<void>,
): Promise<void> {
  try {
    await send();
  } catch (err) {
    logger.error(
      { err },
      "Failed to send email — the triggering action still succeeded",
    );
  }
}

export const emailService: EmailService = realEmailService;
