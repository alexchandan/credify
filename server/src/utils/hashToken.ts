import crypto from "crypto";

/**
 * Generates a cryptographically random raw token — this is the value
 * that goes into an email link (e.g. /verify-email?token=<raw>) and is
 * NEVER stored anywhere. Only its hash is persisted, so a compromised
 * database never exposes usable tokens.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Deterministic hash used to look up a raw token against the stored
 * hash (e.g. User.emailVerificationTokenHash, User.passwordResetTokenHash).
 * SHA-256 is appropriate here — unlike a password, a 32-byte random
 * token has no brute-forceable structure, so a fast, comparable hash
 * is correct; bcrypt's deliberate slowness would only add cost with
 * no real security benefit for this use case.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
