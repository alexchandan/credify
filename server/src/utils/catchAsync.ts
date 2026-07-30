import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
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
