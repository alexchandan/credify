import type { Request, Response, NextFunction } from "express";
import { extractBearerToken } from "./authenticate.js";
import { verifyAccessToken } from "../utils/tokenUtils.js";

/**
 * For routes that work for BOTH anonymous visitors and authenticated
 * users, but behave differently depending on which (e.g. GET /jobs/:id —
 * published jobs are public, but a recruiter viewing their own draft
 * needs req.user set for the canManageJob check).
 *
 * Unlike authenticate(), this never rejects the request:
 *   - no token at all → continues, req.user stays unset (anonymous)
 *   - invalid/expired token → ALSO continues as anonymous, rather than
 *     throwing 401. The point of this route working without a token in
 *     the first place is that authentication isn't required — a stale
 *     token shouldn't turn a route that's supposed to degrade gracefully
 *     into a hard failure. If a route genuinely requires a valid token,
 *     use authenticate(), not this.
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
  } catch {
    // Invalid/expired — proceed as anonymous rather than rejecting.
  }

  next();
}
