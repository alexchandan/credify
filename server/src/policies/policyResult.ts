import { AppError } from "../utils/AppError.js";

export type PolicyResult =
  { allowed: true } | { allowed: false; reason: string };

export const allow = (): PolicyResult => ({ allowed: true });
export const deny = (reason: string): PolicyResult => ({
  allowed: false,
  reason,
});

/**
 * Turns a PolicyResult into a thrown 403 AppError. Services call this
 * right after a policy check instead of re-writing the same
 * "if not allowed, throw" block everywhere:
 *
 *   assertAllowed(await canManageJob(req.user.userId, job));
 */
export function assertAllowed(result: PolicyResult): void {
  if (!result.allowed) {
    throw new AppError(403, "AUTH_FORBIDDEN", result.reason);
  }
}
