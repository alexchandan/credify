import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

type ValidationSource = "body" | "query" | "params";

/**
 * Validates req[source] against a Zod schema and REPLACES req[source] with
 * the parsed result — controllers can trust the shape is already correct
 * and don't need to re-validate or re-check anything.
 *
 * Usage: router.post('/register', validate(registerSchema), catchAsync(authController.register));
 */
export function validate(schema: ZodType, source: ValidationSource = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return next(
        new AppError(400, "VALIDATION_ERROR", "Invalid input", details),
      );
    }

    req[source] = result.data;
    next();
  };
}
