import type { Request, Response, NextFunction } from "express";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Recursive function to prevent No-SQL injection attack by striping out dengerous characters like doller ($) and dots (.) from user inputs.
function sanitizeInPlace(target: unknown): void {
  if (Array.isArray(target)) {
    for (const item of target) {
      sanitizeInPlace(item);
    }
    return;
  }

  if (!isPlainObject(target)) return;

  for (const key of Object.keys(target)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete target[key];
      continue;
    }
    sanitizeInPlace(target[key]);
  }
}

export function mongoSanitize() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    sanitizeInPlace(req.body);
    const sanitizedQuery = req.query;
    sanitizeInPlace(sanitizedQuery);
    Object.defineProperty(req, "query", {
      value: sanitizedQuery,
      writable: false,
      enumerable: true,
      configurable: true,
    });
    sanitizeInPlace(req.params);
    next();
  };
}
