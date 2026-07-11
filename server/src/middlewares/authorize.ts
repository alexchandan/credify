import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import type { UserRole } from "../models/user.model.js";

/**
 * Coarse, role-only gate. Must run AFTER authenticate.
 * Example: router.post('/jobs', authenticate, authorize(UserRole.RECRUITER), ...)
 *
 * This only checks "is this role allowed to call this endpoint at all" —
 * it says nothing about whether this specific user can act on this specific
 * resource. That's what the policies/ layer is for (see policies/*.ts).
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "AUTH_UNAUTHORIZED", "Not authenticated"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          "AUTH_FORBIDDEN",
          "You do not have permission to perform this action",
        ),
      );
    }
    next();
  };
}
