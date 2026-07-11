import type { Request, Response, NextFunction } from "express";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
    sanitizeInPlace(req.query);
    sanitizeInPlace(req.params);
    next();
  };
}
