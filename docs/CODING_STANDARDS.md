# Coding Standards & Definition of Done

## Code Style

- ESLint + Prettier are enforced via a Husky pre-commit hook (`lint-staged`). Code that doesn't pass lint/format cannot be committed.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
  - Example: `feat(jobs): add publish/draft status toggle`

## API Rules (non-negotiable, see API_CONTRACT.md)

- Every controller uses `sendSuccess()` / `sendError()` — never raw `res.json()`.
- Every async controller is wrapped in `catchAsync()` — no manual try/catch in controllers.
- Errors are thrown as `AppError(statusCode, code, message)` — never a plain `throw new Error(...)` in domain logic.
- New error codes must be added to `docs/API_CONTRACT.md` in the same PR that introduces them.

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
