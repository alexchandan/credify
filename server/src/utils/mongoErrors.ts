export interface MongoDuplicateKeyError extends Error {
  code: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

export function isDuplicateKeyError(
  err: unknown,
): err is MongoDuplicateKeyError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  );
}

/**
 * Narrower check: was the duplicate specifically on the given field?
 * Useful when a collection has multiple unique indexes and a service
 * only wants to translate ONE of them into a specific AppError,
 * letting duplicates on other fields fall through to the generic
 * DUPLICATE_ENTRY handling in errorHandler.ts.
 */
export function isDuplicateKeyErrorOnField(
  err: unknown,
  field: string,
): boolean {
  return (
    isDuplicateKeyError(err) &&
    Boolean(err.keyPattern?.[field] ?? err.keyValue?.[field])
  );
}
