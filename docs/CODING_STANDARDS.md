<!-- use markdown preview extension or tools for better experience-->

# Coding Standards & Definition of Done

## TypeScript Configuration

The project's `tsconfig.json` has three strict flags on that shape how code must be written — these aren't optional style preferences, code that ignores them won't compile:

- **`exactOptionalPropertyTypes: true`** — `field?: string` means the property may be _omitted_, but if present, must be exactly `string` — `undefined` is not automatically a valid value to assign to it. Anywhere a field is intentionally cleared (e.g. `user.passwordResetTokenHash = undefined`), that field's type in the model interface must say `field?: Type | undefined` explicitly, not just `field?: Type`.
- **`noUncheckedIndexedAccess: true`** — indexing into an array or a `Record`/plain object (`arr[i]`, `obj[key]`) returns `T | undefined`, not `T`. Always narrow before use (an `if` check, non-null assertion where genuinely guaranteed, or `.at()`).
- **`verbatimModuleSyntax: true`** — imports used only as types must say so explicitly: `import type { Request } from 'express'`, not `import { Request } from 'express'`. Mixing type and value imports from the same module needs two separate import statements (one plain, one `import type`).
- **Express 5** — `req.query` is a read-only getter with no setter. Middleware that tries to reassign it (`req.query = {...}`) will throw at runtime on every request. Only in-place mutation of its properties is safe (see ADR-016 for the concrete incident this caused).

## Code Style

- ESLint + Prettier are enforced via a Husky pre-commit hook (`lint-staged`). Code that doesn't pass lint/format cannot be committed.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
  - Example: `feat(jobs): add publish/draft status toggle`

## API Rules (non-negotiable, see API_CONTRACT.md)

- Every controller uses `sendSuccess()` / `sendError()` — never raw `res.json()`.
- Every async controller is wrapped in `catchAsync()` — no manual try/catch in controllers.
- Errors are thrown as `AppError(statusCode, code, message)` — never a plain `throw new Error(...)` in domain logic, **except** for genuine programmer-invariant checks (a bug signal, not a user-facing condition) — see `Application.ts`'s `_statusChangedBy` guard for the one deliberate exception.
- For Mongoose schema-level validation that should surface as a `400 VALIDATION_ERROR` (not a generic `500`), use `this.invalidate(path, message)` inside a `pre('validate')` hook — not `throw new Error(...)`, which `errorHandler.ts` can't distinguish from an unexpected bug.
- New error codes must be added to `docs/API_CONTRACT.md` in the same PR that introduces them.

## Verification Rule

**A clean `tsc --noEmit` does not mean the server works.** Runtime-only failures — an incompatible dependency, a Mongoose duplicate-index warning, a middleware that misbehaves under the actual Node/Express version in use — do not show up in a type-check. Before considering a module "done," boot the server and hit its endpoints with a real request (`curl` or equivalent), not just a passing compile. ADR-016 is a direct example of a bug that was invisible to `tsc` but broke 100% of requests at runtime.

## Data Rules

- Any new collection or field must be documented in `docs/DATABASE_SCHEMA.md` in the same PR.
- Any non-obvious schema/architecture decision gets an entry in `docs/DECISIONS.md`.
- Soft delete (`deletedAt`) is used instead of hard delete on all core domain collections (see ADR-005). Every query against these collections must explicitly exclude soft-deleted records.
- Indexes are added at schema-design time for any field used in a filter/sort/lookup — not added reactively after noticing a slow query.

## Definition of Done (per feature/module)

A feature is not "done" until all of the following are true:

- [ ] Input validated (Zod schema, shared between frontend and backend where possible)
- [ ] Errors handled via `AppError` with a documented error code
- [ ] Authorization checked (correct role + correct ownership/scope — not just "is logged in")
- [ ] Integration test written (Supertest) covering at least the happy path and one failure case
- [ ] Frontend has loading and error states, not just the happy path
- [ ] Endpoint documented (OpenAPI/Swagger, once introduced in Phase 4)
- [ ] No secrets, PII, or full request bodies written to logs

## Sequencing Rule

Per module: **model → controller → route → validation → test → frontend page → connect → test again.** Don't start the next module until the current one is deployed and clickable end-to-end. This keeps the project demoable at every milestone instead of 80% done across twelve directions at once.
