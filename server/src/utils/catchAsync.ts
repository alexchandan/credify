// src/utils/catchAsync.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrap every async controller with this. If the promise rejects (any
 * throw, including `throw new AppError(...)`), it's automatically
 * forwarded to Express's error-handling middleware via next(err) —
 * no try/catch needed in the controller itself.
 *
 * Usage:
 *   router.get('/jobs/:id', catchAsync(async (req, res) => {
 *     const job = await jobService.getById(req.params.id);
 *     sendSuccess(res, { data: job });
 *   }));
 */
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function catchAsync(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
