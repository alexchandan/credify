# Coding Standards

This document describes the conventions the current Credify codebase follows and
the checks expected for new work. See [Project Status](./PROJECT_STATUS.md) for
known places where the repository does not yet meet these standards.

## TypeScript

Both applications use strict TypeScript, but their compiler settings differ.

- The server enables `strict`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, and `verbatimModuleSyntax`.
- The client enables `strict` through Next.js but does not currently enable the
  server's additional strictness flags.
- Use `import type` for type-only server imports.
- Narrow indexed values before use. Do not assume `array[index]` or a record
  lookup exists.
- With `exactOptionalPropertyTypes`, omit an optional property instead of
  assigning `undefined` unless its type explicitly permits `undefined`.
- Avoid `any`. Prefer a precise interface, `unknown` plus narrowing, or a
  library-provided type.

## Formatting and Naming

- Prettier is the formatting authority; ESLint handles code-quality rules.
- Use PascalCase for React components and Mongoose models, camelCase for
  variables/functions, and UPPER_SNAKE_CASE for constants.
- Name server modules by domain, for example `job.controller.ts`,
  `job.service.ts`, and `job.validation.ts`.
- Keep comments short and reserve them for intent or constraints that the code
  cannot express clearly.
- Commit messages follow Conventional Commits, such as
  `fix(jobs): enforce member ownership`.

## Server Structure

Keep request handling layered:

1. **Route:** declares HTTP method, middleware, and controller.
2. **Validation:** parses params, query, and body with Zod.
3. **Controller:** translates HTTP input/output and delegates domain work.
4. **Service or policy:** owns reusable business rules and authorization scope.
5. **Model:** owns persistence constraints, indexes, and document hooks.

Controllers should stay thin. Do not put ownership logic only in the frontend or
duplicate complex authorization rules across controllers.

## API Conventions

- Prefix application endpoints with `/api/v1`; keep `/health` unversioned.
- Use `sendSuccess()` for successful responses and the global error middleware
  for failures. Do not create a second response envelope.
- Wrap async controllers with `catchAsync()`.
- Throw `AppError(statusCode, code, message)` for expected domain and request
  failures. Plain `Error` is reserved for unexpected invariants.
- Add every new public error code and endpoint to
  [API Contract](./API_CONTRACT.md) in the same change.
- Return `201` for newly created resources and `204` for successful responses
  that intentionally have no body.
- Paginated endpoints should return `page`, `limit`, `totalCount`, and
  `totalPages` in the top-level `meta` object.
- Validate MongoDB IDs before querying so malformed IDs become a stable `400`,
  not a generic server error.
- Avoid `z.coerce.boolean()` for query strings. Parse the literal strings
  `"true"` and `"false"` explicitly.

Express 5 exposes `req.query` through a getter. Middleware may sanitize its
contents in place but must not assign a new object to `req.query`.

## Authentication and Authorization

- Treat authentication, role checks, company membership, ownership, and account
  status as separate checks.
- Perform authorization on the server for every protected operation.
- Keep role policy definitions centralized and cover owner/member/admin
  boundaries with tests.
- Never log access tokens, refresh tokens, password fields, reset tokens, email
  verification tokens, or full authorization headers.
- A state-changing account operation must also update the client session state
  when applicable.

## Validation and Data Integrity

- Validate all externally supplied params, queries, and bodies with Zod before
  the controller runs.
- Keep request validation, TypeScript types, and Mongoose constraints aligned.
- Use `this.invalidate(path, message)` in Mongoose validation hooks when a
  schema violation should surface as a client validation error.
- Add indexes for fields used in recurring filters, sorts, uniqueness checks,
  or joins, and document them in [Database Schema](./DATABASE_SCHEMA.md).
- Use transactions when an operation changes multiple documents that must stay
  consistent, such as application submission and job counters.
- Confirm session-aware queries and writes actually receive the transaction
  session.
- Hooks do not run uniformly across `save`, `insertMany`, and query updates.
  Choose the write API deliberately and test hook-dependent behavior.

## Deletion and Files

- Respect each model's documented deletion behavior. Most user-facing domain
  records use `isDeleted`; activity records are immutable and some auxiliary
  records are physically deleted.
- Every normal read for a soft-deleted model must exclude deleted documents.
- When replacing or deleting a Cloudinary asset, coordinate database and remote
  asset cleanup so the stored reference never points at a removed file.
- Enforce upload MIME type and size on the server even if the client also checks
  them.

## Frontend Conventions

- Only the root Next.js layout may render `<html>` and `<body>`.
- Use the shared `apiClient` for authenticated API requests so refresh and
  credential behavior stays consistent.
- Wait for authentication restoration before redirecting from protected pages.
- A protected page requires both an authentication check and the appropriate
  role check.
- Provide loading, error, empty, and success states for data-driven screens.
- Keep the API base URL in `NEXT_PUBLIC_API_BASE_URL`; do not add new per-page
  fallback ports.
- Prefer reusable domain components over duplicating request and state logic in
  route files.

## Logging and Privacy

- Include the request ID in server logs and user-facing unexpected-error
  responses.
- Configure redaction in every environment, especially production.
- Log useful identifiers and outcomes, not whole request bodies or sensitive
  profile data.
- Use structured logger calls rather than `console.log` in application code.

## Testing and Verification

Test scope should match the change:

- **Unit tests:** parsing, policies, and isolated business rules.
- **Integration tests:** routes, authentication, database behavior, hooks, and
  transactions.
- **End-to-end tests:** high-value browser flows such as registration, sign-in,
  job application, and recruiter review.

The repository does not yet contain an automated test suite, so adding the test
infrastructure is still an open project task. Until it exists, a clean type-check
alone is not enough: boot affected applications and exercise the changed route or
screen with a real request.

Run the available checks from the repository root:

```bash
pnpm format:check
pnpm lint
pnpm type-check
pnpm build
```

The current server `build` script runs `tsc --noEmit`; it validates types but
does not create a production artifact or start command.

## Documentation Responsibilities

Update documentation in the same change when behavior changes:

| Change                                          | Documentation          |
| ----------------------------------------------- | ---------------------- |
| Route, payload, response, status, or error code | `API_CONTRACT.md`      |
| Model field, enum, index, hook, or relationship | `DATABASE_SCHEMA.md`   |
| Non-obvious architectural or security choice    | `DECISIONS.md`         |
| Environment variable or local workflow          | `ENVIRONMENT_SETUP.md` |
| Feature readiness, limitation, or known defect  | `PROJECT_STATUS.md`    |
| Product overview or common command              | Root `README.md`       |

## Definition of Done

- [ ] Inputs are validated and response/error behavior is documented.
- [ ] Authentication, role, scope, ownership, and account state are enforced.
- [ ] Persistence changes preserve indexes, hooks, transactions, and deletion
      semantics.
- [ ] Sensitive data is excluded from logs and responses.
- [ ] The frontend covers loading, error, empty, and success states.
- [ ] Focused automated tests cover the happy path and important failures, or
      the missing test infrastructure is called out explicitly.
- [ ] Formatting, linting, type-checking, and relevant builds pass.
- [ ] The changed flow has been exercised at runtime.
- [ ] All affected documentation is updated.
