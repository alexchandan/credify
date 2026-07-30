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

// to acknowledge error on specific field
export function isDuplicateKeyErrorOnField(
  err: unknown,
  field: string,
): boolean {
  return (
    isDuplicateKeyError(err) &&
    Boolean(err.keyPattern?.[field] ?? err.keyValue?.[field])
  );
}
