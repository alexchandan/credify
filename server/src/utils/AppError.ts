// use case: throw new AppError(404, 'JOB_404', 'Job not found');

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
    super(message); // inherit the parent class Error. equivalent to - const err = new Error(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // flag for is this an expected error. oppose to unexpected bug

    Object.setPrototypeOf(this, AppError.prototype); // this ensure checks such as - err instanceof AppError
    Error.captureStackTrace(this, this.constructor); // removes constructure calls from the stack
  }
}
