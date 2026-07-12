/**
 * Converts a company name into a URL-safe slug. Does NOT guarantee
 * uniqueness — that's checked separately in company.service.ts against
 * the database, since two companies can legitimately have similar names.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
