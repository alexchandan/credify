type DeepStrip<T> = T extends (infer U)[]
  ? U[]
  : T extends Date
    ? T
    : T extends object
      ? { [K in keyof T]?: Exclude<DeepStrip<T[K]>, undefined> }
      : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

export function stripUndefined<T extends Record<string, unknown>>(
  obj: T,
): DeepStrip<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === undefined) continue;
    result[key] = isPlainObject(value) ? stripUndefined(value) : value;
  }
  return result as DeepStrip<T>;
}
