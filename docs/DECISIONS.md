# Architecture Decision Records

These records capture durable design choices and their reasoning. Temporary
bugs, incomplete screens, and remediation work belong in
[Project Status](./PROJECT_STATUS.md), not in an ADR.

Each record uses: decision, rationale, consequences, and status.

## ADR-001: Use a standalone Express API

**Decision:** The backend is a standalone Express/TypeScript application. The
Next.js client communicates with it over a versioned REST API.

**Rationale:** A separate API can serve future clients, keeps domain and data
access independent from the web rendering framework, and supports long-running
or background workflows without coupling them to Next.js route handlers.

**Consequences:** Client/server contracts must be documented and kept in sync.
Cross-origin cookies and CORS require deliberate deployment configuration.

**Status:** Adopted.

## ADR-002: Separate identity from role profiles

**Decision:** `User` stores authentication identity. `CandidateProfile` and
`RecruiterProfile` store role-specific domain data and reference `User` by
`userId`.

**Rationale:** Authentication queries remain small and domain validation does
not become conditional on a large role-dependent user document.

**Consequences:** Registration and account deletion must update two documents
atomically. Services must resolve the appropriate profile when authorization
or domain data is needed.

**Status:** Adopted and implemented.

## ADR-003: Store company membership on recruiter profiles

**Decision:** `RecruiterProfile.companyId` is the source of truth for company
membership. `Company` does not store a `members[]` array.

**Rationale:** Storing the same membership in two places creates synchronization
drift. The indexed recruiter field supports company membership queries without
an ever-growing embedded array.

**Consequences:** Listing members queries `RecruiterProfile`. Company deletion
and membership lifecycle actions must explicitly update recruiter profiles.

**Status:** Adopted. Membership invitation, removal, and ownership-transfer
APIs are not implemented yet.

## ADR-004: Limit a recruiter to one company

**Decision:** A recruiter has either one `companyId` or `null`, not a list of
companies.

**Rationale:** Credify currently models in-house recruiters rather than agency
recruiters. Multi-company membership would require company context switching
throughout jobs, applications, saved candidates, and dashboards.

**Consequences:** `Job.createdBy` is an immutable author reference independent
of the recruiter's current `companyId`. Leaving a company removes management
access granted by current membership.

**Status:** Adopted.

## ADR-005: Use explicit soft deletion for core entities

**Decision:** Users, candidate profiles, recruiter profiles, and companies use
`deletedAt`. Jobs currently use `isDeleted`; a `deletedAt` migration is intended
but incomplete. Applications use lifecycle status, and saved-candidate
relationships are hard-deleted.

**Rationale:** Historical applications, authorship, audit data, and references
should survive account/company/job removal.

**Consequences:** Active-record filtering is explicit in every service query.
There is no global Mongoose query middleware. Each new query must make a
deliberate deletion-scope decision.

**Status:** Adopted with known consistency gaps documented in
[Project Status](./PROJECT_STATUS.md).

## ADR-006: Normalize searchable string arrays on write

**Decision:** Candidate skills, job-required skills, and job locations are
trimmed and lowercased by Mongoose setters.

**Rationale:** Normalization prevents case/whitespace variants from breaking
exact filters and future matching logic.

**Consequences:** Stored values are display-neutral canonical values. UI code
may format them for presentation.

**Status:** Adopted and implemented.

## ADR-007: Create applications transactionally

**Decision:** Applying to a job atomically creates the application, increments
`Job.applicationCount`, and creates a recruiter notification with
`session.withTransaction()`.

**Rationale:** The writes represent one business action. Partial completion
would create counter drift or applications recruiters never learn about.

**Consequences:** Development and production MongoDB must support transactions,
which requires a replica set. Application-count updates outside this service
can still cause drift and should be avoided.

**Status:** Adopted and implemented.

## ADR-008: Keep saved candidates private per recruiter

**Decision:** `SavedCandidate` is unique by `(recruiterId, candidateId)` and is
not shared company-wide.

**Rationale:** The initial product requirement is a recruiter's personal
shortlist, with an optional private note.

**Consequences:** Team shortlists would be a new feature with different
ownership and query semantics, not a transparent schema tweak.

**Status:** Adopted and implemented.

## ADR-009: Use polymorphic entity references for event records

**Decision:** Notifications store `relatedEntityType` and `relatedEntityId`.
Activity logs store the equivalent `targetType` and `targetId`. Both IDs use a
Mongoose `refPath`.

**Rationale:** Event records can refer to different domain models without
adding a new optional foreign-key field for every new event type.

**Consequences:** The database cannot statically guarantee that the selected
type and ID refer to a real matching model. Services must create consistent
pairs.

**Status:** Adopted and implemented.

## ADR-010: Treat activity logs as immutable

**Decision:** Activity fields are immutable, no `updatedAt` is generated, and
the schema rejects `findOneAndUpdate`, `updateOne`, and `updateMany`.

**Rationale:** Audit records lose their value when application code can rewrite
history after an action occurs.

**Consequences:** Corrections require a new compensating event rather than
editing the old event. Activity creation is currently instrumented only for
selected admin actions.

**Status:** Adopted; instrumentation coverage is incomplete.

## ADR-011: Snapshot the resume on application

**Decision:** `Application.resumeSnapshotUrl` copies the candidate's current
resume URL when they apply.

**Rationale:** A recruiter reviewing an old application should see the resume
that was submitted, not a later replacement on the candidate profile.

**Consequences:** Replacing a candidate's current Cloudinary asset must not
invalidate historical application URLs. The current upload replacement flow
deletes the previous asset, so long-term snapshot durability needs review.

**Status:** Data-model decision implemented; storage-retention behavior remains
an open product/data-integrity issue.

## ADR-012: Design AI report persistence before AI execution

**Decision:** Keep a typed `AIReport` model with `pending`, `completed`, and
`failed` states before introducing an AI provider or background worker.

**Rationale:** A stable persistence lifecycle separates report requests and
history from any future provider/queue choice.

**Consequences:** The model is intentionally unused until request policies,
provider selection, queueing, cost controls, and result schemas are designed.

**Status:** Schema adopted; execution and API work not started.

## ADR-013: Use link tokens for email verification and password reset

**Decision:** Generate 32 random bytes, email the raw token in a link, and store
only its SHA-256 hash.

**Rationale:** High-entropy link tokens do not have the brute-force constraints
of short numeric OTPs and keep usable tokens out of the database.

**Consequences:** Verification links expire after 24 hours. Password-reset
links expire after 30 minutes. Email delivery failures are logged while the
triggering database action remains successful.

**Status:** Adopted and implemented.

## ADR-014: Rotate refresh tokens without reuse detection for now

**Decision:** Every refresh returns a new access/refresh pair and validates the
user's `tokenVersion`, but consumed refresh tokens are not stored or
blacklisted.

**Rationale:** Single-use reuse detection needs a persisted token/JTI store.
That infrastructure does not exist yet.

**Consequences:** A copied still-valid refresh token can be replayed until
expiry or `tokenVersion` changes. `tokenVersion` invalidates refresh tokens,
not already-issued 15-minute access tokens.

**Status:** Interim decision adopted. Revisit when a Redis or database-backed
session store is introduced.

## ADR-015: Query current profile membership in resource policies

**Decision:** Resource policies fetch the current candidate/recruiter profile
instead of embedding company membership in long-lived tokens.

**Rationale:** A recruiter who leaves a company must lose company-scoped access
without waiting for a refresh token to expire.

**Consequences:** Protected resource operations incur a profile query. Policies
currently do not also query `User.deletedAt`, so active access tokens for a
suspended user remain a known gap.

**Status:** Adopted with an active-user-check follow-up.

## ADR-016: Replace `express-mongo-sanitize` for Express 5

**Decision:** Use local request sanitization and schema validation. Query
middleware must shadow Express 5's prototype getter with an own validated
property via `Object.defineProperty()` when parsed values must persist.

**Rationale:** `express-mongo-sanitize@2.2.0` reassigns `req.query`, but Express
5 exposes it as a read-only getter. The package caused a runtime failure on
every request even though TypeScript passed.

**Consequences:** Assigning directly to `req.query` remains invalid, while
mutating a single getter result is not persistent. Framework upgrades require
boot and request tests, not only compilation.

**Status:** Adopted and implemented.

## ADR-017: Use partial unique indexes for soft-deletable identifiers

**Decision:** `User.email` and `Company.slug` use explicit unique indexes with
`partialFilterExpression: { deletedAt: null }` instead of inline
`unique: true`.

**Rationale:** Soft-deleted accounts/companies should not permanently reserve
an email or slug, and duplicate inline plus explicit indexes caused Mongoose
warnings.

**Consequences:** Services query active records before creation for a friendly
error, but the partial unique index remains the concurrency-safe guarantee.

**Status:** Adopted and implemented.

## ADR-018: Keep access tokens in memory on the client

**Decision:** The browser client stores the access token in an `AuthProvider`
ref, while the refresh token remains in an HTTP-only cookie.

**Rationale:** JavaScript cannot read the refresh credential, and the access
token is not persisted in local/session storage. A silent refresh plus
`GET /auth/me` restores identity after reload.

**Consequences:** Protected requests must go through the shared API client.
The client coalesces concurrent refresh attempts. Route components must wait
for initial session restoration before issuing protected requests.

**Status:** Adopted; route guarding and a few account-state integrations remain
incomplete.

## ADR-019: Stream uploads from memory to Cloudinary

**Decision:** Multer uses memory storage. Avatar, resume, and logo buffers are
streamed to Cloudinary without writing temporary files to the application server.

**Rationale:** The server remains stateless and avoids local filesystem cleanup
or assumptions that do not hold in container/serverless environments.

**Consequences:** Strict upload limits are required to bound memory usage: 3
MiB for avatars, 5 MiB for resumes, and 2 MiB for logos. Replacement uploads
save the new asset before attempting best-effort deletion of the old one.

**Status:** Adopted and implemented.

## ADR-020: Use Atlas Search for fuzzy discovery

**Decision:** Job and candidate fuzzy search use Atlas `$search` pipelines and
explicitly named `job_search` and `candidate_search` indexes.

**Rationale:** Fuzzy multi-field relevance search exceeds what normal MongoDB
text indexes provide while keeping data in the existing Atlas deployment.

**Consequences:** Search index creation is a separate infrastructure step via
`pnpm --dir server search:setup`. Search does not work on a plain MongoDB
deployment without Atlas Search support.

**Status:** Implemented by inspection; live Atlas verification and filtered
count correction are pending.
