import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Attaches a unique ID to every incoming request and echoes it back in
 * the response header. Combined with pino-http (see app.js), every log
 * line for this request will include req.id — so when something breaks,
 * you can grep one ID and see the entire request's journey through logs.
 */
export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  req.id = req.header("x-request-id") ?? uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
}
