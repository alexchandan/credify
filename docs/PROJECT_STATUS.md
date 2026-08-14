# Project Status

**Snapshot date:** 2026-08-14

This is a point-in-time implementation and risk inventory. It complements the
normative [API Contract](./API_CONTRACT.md), [Database Schema](./DATABASE_SCHEMA.md),
and [Architecture Decisions](./DECISIONS.md). Update it when a listed gap is
fixed or a major capability changes readiness.

## Current Shape

Credify is a pnpm monorepo with:

- a Next.js 16 / React 19 client in `client/`;
- an Express 5 / Mongoose 9 API in `server/`;
- MongoDB Atlas Search for candidate and job discovery;
- Cloudinary-backed candidate avatar/resume and company-logo uploads; and
- Resend-backed verification and password-reset email.

The backend is substantially broader than the client. The API currently mounts
57 versioned endpoints across auth, candidates, recruiters, companies, jobs,
applications, search, saved candidates, notifications, dashboards, and admin
modules, plus service discovery and health routes.

## Feature Readiness

| Area                                                   | Backend     | Frontend        | Notes                                                                                                      |
| ------------------------------------------------------ | ----------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| Registration, verification, sign-in, refresh, sign-out | Implemented | Implemented     | Email verification, refresh-cookie restoration, and shared auth state are wired.                           |
| Password recovery                                      | Implemented | Implemented     | Includes request and token reset pages.                                                                    |
| Password/account settings                              | Implemented | Implemented     | Password changes install the new token; deletion clears the client session.                                |
| Candidate profile, avatar, and resume                  | Implemented | Implemented     | Full profile editing, image/PDF upload and removal, shared header identity, and role protection are wired. |
| Recruiter profile                                      | Implemented | Not implemented | API supports self profile and company linkage.                                                             |
| Company management                                     | Implemented | Not implemented | Owner/member policy exists; deletion cascade is unresolved.                                                |
| Jobs                                                   | Implemented | Partial         | Public job browsing, filtering, details, and pagination exist; recruiter UI is absent.                     |
| Applications                                           | Implemented | Partial         | Candidate submission exists; history, withdrawal, review, and status UI are absent.                        |
| Candidate/job search                                   | Implemented | Partial         | Public job search is wired; candidate search has no UI. Atlas indexes are required.                        |
| Saved candidates                                       | Implemented | Not implemented | Recruiter API only.                                                                                        |
| Notifications                                          | Implemented | Partial         | Header shows unread count; candidate dashboard shows five recent updates and supports mark-all-read.       |
| Interface theme                                        | N/A         | Implemented     | System-aware light/dark mode is available globally and persists the selected preference.                   |
| Dashboards                                             | Implemented | Partial         | Candidate dashboard is responsive and data-backed; recruiter and admin dashboards remain API-only.         |
| Administration                                         | Implemented | Not implemented | User moderation and company/job removal exist.                                                             |
| AI reports                                             | Model only  | Not implemented | No generation provider, queue, endpoints, or UI.                                                           |

## Client Routes

The current page routes are:

- `/`
- `/login`
- `/register`
- `/check-email`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/unauthorized`
- `/jobs`
- `/jobs/:id`
- `/candidate/dashboard`
- `/candidate/profile`

## Verification Baseline

The following checks were performed while this documentation snapshot was
prepared:

| Check                       | Result  | Detail                                                                                                                                       |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace type-check        | Pass    | Both client and server TypeScript checks pass.                                                                                               |
| Client production build     | Pass    | Next.js production compilation succeeds.                                                                                                     |
| Server production build     | Pass    | TypeScript emits `server/dist/server.js`; test files are excluded from the artifact.                                                         |
| Client lint                 | Pass    | ESLint completes without errors or warnings.                                                                                                 |
| Server lint                 | Pass    | ESLint completes without errors or warnings.                                                                                                 |
| Prettier                    | Pass    | The repository passes the configured Prettier check.                                                                                         |
| Browser smoke check         | Pass    | Candidate login redirect, populated dashboard, mark-all-read, light/dark themes, and 390px layout pass without console warnings or overflow. |
| Automated tests             | Minimal | Six middleware, candidate profile payload, and dashboard aggregation tests pass; broader coverage is absent.                                 |
| Live API/Atlas verification | Partial | Public job filters and the populated candidate dashboard pass against the configured live dataset.                                           |
| Dependency advisory audit   | Pending | `pnpm audit --prod` still needs a network-enabled release environment.                                                                       |

## Priority Risks

### P1: Authorization and Account State

1. **Job management scope is broader than the stated member policy.**
   `canManageJob` allows any recruiter currently belonging to the company to
   edit, publish, close, or delete any company job. If members should manage
   only their own jobs while owners manage all jobs, the policy must also check
   `createdBy` and recruiter role.
2. **Suspension is not immediate for access tokens.**
   Access-token middleware verifies the JWT without loading current user state
   or checking `tokenVersion`. Suspension and global logout block refresh, but
   an issued access token remains usable until it expires.
3. **Suspended users can leave active profiles visible.**
   Admin moderation soft-deletes/restores the `User` document but does not
   synchronize candidate/recruiter profile visibility. Public profile and
   search queries can therefore expose a suspended user's profile.
4. **Seeded candidate passwords bypass hashing.**
   The seed script creates candidate users with `insertMany()`, which skips the
   Mongoose `save` password hook. Those values may be stored unhashed and the
   documented shared login may fail.

### P1: Data and File Integrity

1. **Resume snapshots are mutable in practice.**
   Applications store the candidate's current resume URL, but replacing the
   resume deletes the previous Cloudinary asset. Older applications can then
   point to a missing file instead of preserving the submitted resume.
2. **Job deletion fields disagree.**
   Job services assign both `isDeleted` and `deletedAt`, but `deletedAt` is only
   declared in the TypeScript interface, not the Mongoose schema. The timestamp
   is therefore not persisted under the schema's strict behavior.

### P2: API Correctness and Lifecycle

1. Boolean query filters use `z.coerce.boolean()`. The string `"false"` is
   truthy in JavaScript and can be parsed as `true` for job and notification
   filters.
2. Candidate Atlas Search counts are computed before the later `deletedAt`
   filter, so candidate-search pagination totals can exceed visible results.
3. Some service queries accept unvalidated ObjectId strings. A malformed ID can
   surface as a Mongoose cast error and become a `500` instead of a stable
   client error.
4. Company soft deletion does not close/delete company jobs, remove recruiter
   membership, or prevent all associated data from appearing through every
   read path.

## Delivery Gaps

- Automated coverage is limited to focused middleware, candidate payload, and
  dashboard aggregation tests; API integration and browser end-to-end tests are
  still absent.
- There is no CI workflow or provider-specific deployment manifest. A
  platform-neutral deployment runbook now documents the build and runtime
  contract.
- Most API modules have no corresponding client workflow.
- OpenAPI/Swagger output is not generated from the written API contract.
- Atlas Search pipelines and index creation have not been exercised against a
  production-like dataset as part of this audit.
- Activity logging covers selected admin actions, not every action represented
  by the activity-log model.
- AI reports remain a persistence schema without processing infrastructure.
- Production Atlas connectivity, Atlas Search readiness, Resend delivery,
  Cloudinary lifecycle behavior, and dependency advisories require verification
  in the target environment before release.

## Recommended Work Order

1. Fix access control and session invalidation, then add authorization tests.
2. Repair seed password hashing, resume snapshot retention, and job deletion
   persistence.
3. Expand test infrastructure around auth, job policy, applications, and
   account moderation.
4. Add automated protected-route tests for the candidate route guard.
5. Correct boolean parsing, ObjectId validation, candidate-search totals, and
   deletion cascades.
6. Add CI and provider-specific deployment configuration.
7. Build the missing recruiter, job-management, application-history,
   full-notification, recruiter/admin dashboard, and admin client flows.
8. Add AI processing only after its provider, privacy, cost, retry, and data
   retention decisions are explicit.
