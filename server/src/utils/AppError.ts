/**
 * Throw this anywhere in a controller/service instead of a plain Error.
 * Example: throw new AppError(404, 'JOB_404', 'Job not found');
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: unknown[] = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    // Marks this as an error we anticipated and handled deliberately,
    // as opposed to an unexpected bug — useful for logging severity later.
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
