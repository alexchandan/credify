/**
 * Zod's `.optional()` fields produce the type `{ field?: T | undefined }` —
 * both an optional key AND an explicit `undefined` in the value union
 * (this is Zod v4's exactOptionalPropertyTypes-compatible output shape).
 *
 * Mongoose's own generated types for `.create()` / `.save()` / query
 * filters expect the OPPOSITE shape: `{ field?: T }` — optional key,
 * but never an explicit `undefined` value. Spreading a Zod-parsed object
 * directly into a Mongoose call fails to type-check under
 * exactOptionalPropertyTypes because of this mismatch, even though the
 * runtime values are perfectly fine either way.
 *
 * This strips any key whose value is `undefined` and narrows the return
 * type to match what Mongoose expects, so `{ ...stripUndefined(input) }`
 * type-checks cleanly into any Mongoose create/update call.
 */
export function stripUndefined<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as { [K in keyof T]?: Exclude<T[K], undefined> };
}
