import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { isDuplicateKeyError } from "../utils/mongoErrors.js";

/**
 * This must be the LAST middleware registered in app.ts.
 * Every error thrown anywhere in the app (via catchAsync forwarding it
 * to next(err)) ends up here, and here alone. This is the only place
 * that decides what error response shape actually goes out to the client.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): Response {
  // Errors we threw on purpose (AppError) already know their status/code.
  if (err instanceof AppError) {
    logger.warn(
      { reqId: req.id, code: err.code, message: err.message },
      "Handled error",
    );
    return sendError(res, {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Common Mongoose errors get translated into clean responses too,
  // instead of leaking raw driver error messages to the client.
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    return sendError(res, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid input",
      details,
    });
  }

  if (isDuplicateKeyError(err)) {
    return sendError(res, {
      statusCode: 409,
      code: "DUPLICATE_ENTRY",
      message: "A record with this value already exists",
      details: Object.keys(err.keyValue || {}),
    });
  }

  // Anything else is unexpected — log the full stack, but never leak
  // internals to the client.
  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error({ reqId: req.id, err }, "Unhandled error");
  return sendError(res, {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: env.nodeEnv === "production" ? "Something went wrong" : message,
  });
}

/**
 * Catches requests to routes that don't exist at all.
 * Register this right before errorHandler.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new AppError(
      404,
      "ROUTE_NOT_FOUND",
      `No route for ${req.method} ${req.originalUrl}`,
    ),
  );
}
