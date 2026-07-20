import { ApiError } from "./apiClient";

/**
 * The backend's VALIDATION_ERROR details are strings like "email: Invalid
 * email address" — this turns that array into a { fieldName: message }
 * map so forms can show errors next to the relevant field.
 */
export function parseFieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || err.code !== "VALIDATION_ERROR") {
    return {};
  }

  const fieldErrors: Record<string, string> = {};
  for (const detail of err.details) {
    const separatorIndex = detail.indexOf(":");
    if (separatorIndex === -1) continue;
    const field = detail.slice(0, separatorIndex).trim();
    const message = detail.slice(separatorIndex + 1).trim();
    fieldErrors[field] = message;
  }
  return fieldErrors;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
