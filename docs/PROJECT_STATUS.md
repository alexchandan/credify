# Project Status

**Snapshot date:** 2026-10-03 · **Workspace version:** 1.6.1

**Code reviewed through:** `be15fca` (2026-10-02, production refresh-cookie fix)

This inventory reflects the checked-in implementation. It complements the
[API Contract](./API_CONTRACT.md), [Database Schema](./DATABASE_SCHEMA.md), and
[Architecture Decisions](./DECISIONS.md). Implemented means the code is wired;
it does not imply every flow has been verified against production services.

## Current Shape

Credify is a pnpm monorepo with a Next.js 16 / React 19 client and an Express 5 /
Mongoose 9 API. MongoDB supports transactional recruitment workflows, Atlas
Search provides fuzzy discovery, Cloudinary stores uploads, and Resend sends
verification, password-reset, and application emails.

The server mounts 60 domain endpoints across 11 route modules, plus `/api/v1`,
`/health`, and the plain-text `/` service probe. The client now covers the core
candidate and recruiter workflows. Dedicated admin management remains API-only;
signed-in administrators have a summary on the home page.

## Feature Readiness

| Area                                                   | Backend     | Frontend        | Notes                                                                                                            |
| ------------------------------------------------------ | ----------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Registration, verification, sign-in, refresh, sign-out | Implemented | Implemented     | In-memory access token, refresh cookie, enriched identity, and shared auth state                                 |
| Password recovery and account settings                 | Implemented | Implemented     | Reset/change password, global logout, and password-confirmed account deletion                                    |
| Account recovery and permanent cleanup                 | Implemented | Implemented     | Seven-day recovery from login or password reset; startup/hourly purge and lazy auth cleanup                      |
| Candidate profile and uploads                          | Implemented | Implemented     | Education, experience, projects, certifications, skills, links, avatar, and resume                               |
| Recruiter profile and companies                        | Implemented | Implemented     | Company create/edit/logo, membership display, leave-company workflow, and public company profile                 |
| Jobs                                                   | Implemented | Implemented     | Public search/list/grid views and recruiter create/edit/publish/close/delete                                     |
| Applications                                           | Implemented | Implemented     | Candidate history/withdrawal and recruiter applicant review/status changes                                       |
| Candidate/job search                                   | Implemented | Implemented     | Recruiter candidate filters, pagination, profile drawer, and MongoDB fallback; public job board uses `/jobs`     |
| Saved candidates                                       | Implemented | Implemented     | Private shortlist, notes, edits, and removal                                                                     |
| Notifications                                          | Implemented | Partial         | Shared dropdown, unread count, mark-all-read, and SSE listeners; dedicated feed page pending                     |
| Dashboards and home                                    | Implemented | Partial         | Candidate/recruiter workspaces plus personalized home summaries for all roles; dedicated admin dashboard pending |
| Theme and navigation                                   | N/A         | Implemented     | Responsive light/dark UI, role-aware chrome, identity snapshot, route guards, skeletons, and top progress bar    |
| Administration                                         | Implemented | Summary only    | Moderation and company/job deletion lack dedicated management screens                                            |
| AI reports                                             | Model only  | Not implemented | No provider, queue, generation endpoint, or AI UI                                                                |

## Client Routes

| Group          | Routes                                                                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public         | `/`, `/jobs`, `/jobs/:id`, `/companies/:id`                                                                                                                                                                    |
| Authentication | `/login`, `/register`, `/check-email`, `/verify-email`, `/forgot-password`, `/reset-password`, `/unauthorized`                                                                                                 |
| Candidate      | `/candidate/dashboard`, `/candidate/profile`, `/candidate/applications`                                                                                                                                        |
| Recruiter      | `/recruiter/dashboard`, `/recruiter/profile`, `/recruiter/jobs`, `/recruiter/jobs/new`, `/recruiter/jobs/:id/edit`, `/recruiter/jobs/:id/applications`, `/recruiter/candidates`, `/recruiter/saved-candidates` |

The root layout and landing page read the unsigned `credify-auth-user` cookie
for initial rendering. Next.js proxy redirects guest/protected routes from
that snapshot; `RequireRole` and `RequireGuest` handle client navigation.
The API still requires a verified access JWT. The provider restores the token
silently and loads `/auth/me`; its current `isLoading` initializer is always
false, so this flag does not expose the pending restoration to route consumers.

## Recent Delivered Work

- Recruiter job management, applicant pipelines, candidate discovery, saved
  candidates, candidate history, and public company pages are wired to APIs.
- Signed-in home overviews now show role-specific work and live summaries.
- Public jobs and recruiter candidate search offer list/grid views.
- Shared route skeletons and navigation progress accompany the refreshed UI.
- Application submission/status changes emit process-local SSE events, and the
  header forwards them to candidate history and recruiter pipelines.
- Accounts have a seven-day recovery window and recurring permanent cleanup.
- Commit hooks synchronize semantic versions across all three package files.
- The 1.6.1 refresh-cookie fix uses `SameSite=None; Secure` in production and
  `SameSite=Lax` in development/test. The Next.js same-origin proxy remains the
  default topology.

## Verification Baseline

This snapshot is based on route, schema, service, client, and hook inspection.
Local results from the documentation refresh are recorded below.
Earlier browser/API checks described by the August snapshot are historical;
production credentials, cookies, email, uploads, Atlas Search, and the expanded
workflows need current runtime verification before a release decision.

| Check                              | Result    | Detail                                                                                                       |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| Documentation consistency          | Reviewed  | Routes, package version, cookie options, recovery lifecycle, search behavior, and hooks compared with source |
| Markdown formatting and links      | Pass      | Updated Markdown passes Prettier; local documentation links resolve                                          |
| Focused server tests               | Pass      | All seven middleware, candidate payload, and dashboard helper tests pass                                     |
| Workspace type-check               | Partial   | Server passes; client fails on stale `.next/dev/types/validator.ts` imports of removed assessment routes     |
| Production builds and lint         | Not rerun | Documentation-only update; no application source changed                                                     |
| Browser and live external services | Not rerun | Current end-to-end behavior is not certified by this documentation refresh                                   |
| Dependency advisory audit          | Pending   | Run `pnpm audit --prod` in the release environment                                                           |

The client diagnostics reference removed assessment and practice-test pages in
generated Next.js development types. These are cache references, not current
features; regenerate stale `.next` output before retrying the client check.
No application source was changed in this documentation update.

## Priority Risks

### P1: Authorization and Account Lifecycle

1. **Company members can manage all company jobs.** `canManageJob` checks current
   membership but not `createdBy` or the member's company role. Reconcile this
   with the documented policy that members manage only their own jobs.
2. **Existing access JWTs survive suspension/global logout until expiry.** The
   middleware checks neither current user state nor `tokenVersion`. Refresh
   is revoked, but an issued access token can remain usable for 15 minutes.
3. **Admin suspension shares the self-deletion recovery/purge field.** Moderation
   sets `User.deletedAt`, while recovery can restore any deleted account within
   seven days and the scheduler purges any older deleted user. There is no
   separate suspension marker. This permits recovery of suspended users and
   makes a long suspension eligible for permanent purge.
4. **Admin moderation does not synchronize profile visibility.** Candidate and
   recruiter profiles can remain searchable after the user is suspended.
5. **Seeded candidate passwords bypass hashing.** `User.insertMany()` skips the
   password `save` hook, so candidate seed credentials may be stored unhashed
   and fail authentication.

### P1: Data and File Integrity

1. **Resume snapshots can point at deleted files.** Replacing/removing the
   candidate resume deletes the asset referenced by older applications.
2. **Job deletion timestamps are not persisted.** Services set `deletedAt`, but
   the Job schema defines only `isDeleted`.
3. **Permanent cleanup does not reconcile every dependent record.** Candidate
   purge removes applications without adjusting job application counters and
   leaves other recruiters' saved-candidate references. Recruiter purge can
   leave author references on retained jobs. Company-logo Cloudinary cleanup
   is absent from the company purge path.

### P2: API Correctness, Search, and Realtime

1. `z.coerce.boolean()` treats non-empty `"false"` as true for `isRemote` and
   `isRead` query filters.
2. Candidate Atlas counts precede the deleted-profile filter; the successful
   Atlas pipeline ignores `skill`, while the MongoDB fallback honors it.
   Job search now counts after its visibility/filter stages using `$facet`.
3. Some ObjectId parameters are not validated before querying and can surface
   as `500` cast errors.
4. Company soft deletion does not consistently close jobs or remove memberships.
5. SSE clients live only in each API process; there is no cross-instance event
   bus or replay. The header captures the current token when its effect runs,
   which can miss connection setup after reload, and does not explicitly rotate
   the stream URL when the 15-minute token expires. Stream authentication also
   places the access token in a URL that logger redaction does not cover.
6. The identity snapshot is unsigned and can be stale or edited. It is suitable
   only for display/navigation. Auth-restoration and logout rendering need
   regression coverage, including the landing's server snapshot fallback.

## Delivery Gaps

- Dedicated admin moderation/management and a full notification feed are absent.
- Candidate application history, recruiter jobs/pipelines, saved candidates,
  and public company jobs load a first page of at most 50 records without
  next-page controls. Candidate discovery and public jobs have pagination.
- Automated coverage is limited to seven focused tests; auth, recovery/purge,
  policies, SSE, API integration, and browser end-to-end coverage remain absent.
- No CI workflow, generated OpenAPI specification, provider-specific deployment
  manifest, or container image is checked in.
- Company invitation, member removal, and ownership-transfer APIs are pending.
- Activity logging covers selected admin actions rather than every modeled event.
- Atlas fuzzy candidate behavior, Cloudinary retention/cleanup, Resend delivery,
  and production cookie behavior need verification in the target deployment.
- AI remains a persistence model without execution infrastructure.

## Recommended Work Order

1. Separate suspension from account deletion/recovery/purge, enforce active-user
   access, and cover company-job authorization with tests.
2. Fix seed hashing, resume retention, deletion timestamps, and purge integrity.
3. Test authentication restoration, proxy/role guards, recovery, and SSE; fix
   connection/token handling and define multi-instance event delivery.
4. Correct boolean parsing, ObjectId validation, candidate-search filters/counts,
   and company deletion cascades.
5. Add pagination to capped views, CI, and a repeatable deployment release gate.
6. Build admin management and notification-feed pages, then membership lifecycle.
7. Add AI only after provider, privacy, cost, retries, and retention are defined.
