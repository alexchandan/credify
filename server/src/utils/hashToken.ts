import crypto from "node:crypto";

/**
 * Generates a cryptographically random raw token — this is the value
 * that goes into an email link (e.g. /verify-email?token=<raw>) and is
 * NEVER stored anywhere. Only its hash is persisted, so a compromised
 * database never exposes usable tokens.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
