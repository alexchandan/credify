import type { Response } from "express";

/**
 * These two functions are the ONLY way controllers should send a response.
 * Never call res.json(...) directly in a controller — always go through
 * sendSuccess or sendError, so every endpoint in the entire API returns
 * the exact same shape.
 */

interface SuccessOptions<T> {
  data?: T | null;
  message?: string;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

interface ErrorOptions {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown[];
}

interface SuccessBody<T> {
  success: true;
  data: T | null;
  message: string;
  meta?: Record<string, unknown>;
}

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

//fucntion(p1:type, p2:type):return type
export function sendSuccess<T>(
  res: Response,
  {
    data = null,
    message = "",
    statusCode = 200,
    meta = undefined,
  }: SuccessOptions<T>,
): Response<SuccessBody<T>> {
  const body: SuccessBody<T> = { success: true, data, message };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  {
    statusCode = 500,
    code = "INTERNAL_ERROR",
    message = "Something went wrong",
    details = [],
  }: ErrorOptions,
): Response<ErrorBody> {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
}
