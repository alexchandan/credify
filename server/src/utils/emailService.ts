import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

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
      <a href="${ctaUrl}" style="display: inline-block; margin-top: 20px; background: #ff5100; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
        ${ctaLabel}
      </a>
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
        "We received a request to reset your password. If this wasn't you, you can safely ignore this email. This link expires in 30 minutes.",
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
