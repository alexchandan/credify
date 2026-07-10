<!-- use markdown preview extension or tools for better experience-->

# Architecture Decision Records (ADRs)

Short records of non-obvious decisions and the reasoning behind them, so they aren't accidentally re-litigated or reversed without cause later. Add a new entry any time a real "which way do we go" decision gets made.

Format: **Decision → Why → Alternatives considered → Status**

---

## ADR-001: Separate Express backend instead of Next.js API routes

**Decision:** Backend is a standalone Express + TypeScript API, fully separate from the Next.js frontend, communicating over REST.

**Why:** The project's explicit goal is to demonstrate enterprise-level, scalable architecture — not to ship an MVP as fast as possible. A separate API is reusable across future clients (mobile app, partner integrations), easier to test in isolation (Supertest vs. mocking Next.js server actions), and isn't constrained by serverless function execution limits for longer-running work like AI calls.

**Alternatives considered:** Next.js fullstack (API routes/Server Actions) — rejected as the right call for a fast MVP, but undercuts the stated architecture goal. A BFF hybrid (Next.js thin layer calling a separate service) — rejected as unnecessary complexity for this project's scale.

**Status:** Adopted.

---

## ADR-002: User identity and profile data are separate collections

**Decision:** `User` holds only auth fields (email, passwordHash, role, tokenVersion). `CandidateProfile` and `RecruiterProfile` hold all domain/profile data, referencing `User` via `userId`.

**Why:** Conflating identity with profile data is the most common schema mistake in projects like this — it leads to bloated auth queries, awkward role-switching, and messy validation (auth rules vs. profile rules mixed in one schema).

**Alternatives considered:** Single `User` collection with a `role`-dependent shape (discriminators) — rejected as harder to reason about and query cleanly for two quite different domain shapes.

**Status:** Adopted.

---

## ADR-003: Company membership is queried via `RecruiterProfile.companyId`, not a `members[]` array on `Company`

**Decision:** `RecruiterProfile` stores `companyId` (a reference). `Company` does not maintain a `members` array.

**Why:** Maintaining membership in two places (an array on `Company` and a reference on `RecruiterProfile`) creates a synchronization problem — one could be updated without the other, causing drift. A single source of truth queried via an indexed `find({ companyId })` is simpler and always consistent.

**Alternatives considered:** Array of recruiter references on `Company` — rejected due to the drift risk and because Mongo arrays don't scale well as a company's recruiter headcount grows.

**Status:** Adopted.

---

## ADR-004: One recruiter belongs to at most one company at a time

**Decision:** `RecruiterProfile.companyId` is a single reference (or `null`), not an array. Recruiters can switch companies over time by updating this field, but cannot belong to two companies simultaneously.

**Why:** The project spec describes in-house recruiters hiring for a single employer — not staffing/agency recruiters managing multiple clients. This matches every feature described (job creation, candidate search, dashboards are all single-company-context). Supporting multi-company recruiters would require an "acting as which company" context switcher across nearly every screen — real added complexity solving a problem the project doesn't have.

**Consequence:** `Job.createdBy` (once built) must be an independent, permanent reference — it must not be derived from the recruiter's _current_ `companyId`, since that can change after the job was created.

**Alternatives considered:** Many-to-many via a `CompanyMembership` join collection — rejected for now as unneeded complexity, but noted as the additive (non-breaking) path if agency support is ever required later.

**Status:** Adopted.

---

## ADR-005: Soft delete instead of hard delete on core entities

**Decision:** `User`, `CandidateProfile`, `RecruiterProfile`, `Company` (and `Job`, `Application` once built) use a `deletedAt: Date | null` field instead of being physically removed from the database.

**Why:** Recruitment platforms need to preserve history — a closed job's past applications, a company's historical postings, audit trails — even after a user requests deletion of their own record. Hard deletes also risk orphaned references (a `Job` pointing to a deleted `Company`).

**Consequence:** Every query that should exclude deleted records must explicitly filter `deletedAt: null` — this is not automatic and needs a consistent query helper/middleware once services are built, to avoid accidentally leaking soft-deleted records.

**Alternatives considered:** Hard delete with cascading cleanup — rejected due to data-loss risk and legal/audit concerns around candidate PII retention.

**Status:** Adopted. **Open follow-up:** decide the query-scoping mechanism (Mongoose query middleware vs. explicit filters in every service call) before Phase 3 services are written.

---

## ADR-006: `skills` field is normalized (lowercase, trimmed) at write time

**Decision:** `CandidateProfile.skills` uses a Mongoose `set` transform to lowercase and trim every value before it's saved.

**Why:** Without normalization, `"React"`, `"react "`, and `"REACT"` are stored as distinct strings, silently breaking any skill-based search or matching feature.

**Status:** Adopted. Same transform is applied to `Job.skillsRequired`, since these two fields are what future matching/search features join against — they must normalize identically or matches will silently fail.

---

## ADR-007: Application creation is a multi-document transaction

**Decision:** Creating an `Application` must atomically (1) insert the `Application` document, (2) increment `Job.applicationCount`, and (3) create a `Notification` for the recruiter — wrapped in `session.withTransaction()`.

**Why:** These three writes are logically one operation. If the notification write failed silently after the application was created, a recruiter would never learn about a real application. If the counter increment failed, job cards would show inaccurate application counts indefinitely. MongoDB transactions (available on Atlas via its replica-set-backed clusters) exist specifically for this.

**Consequence:** `Job.applicationCount` is a denormalized counter, not computed live — it trades a small risk of drift (only if a transaction is bypassed) for avoiding a `COUNT` query against `applications` on every job card render.

**Status:** Adopted. To be implemented in the Phase 3 Application service.

---

## ADR-008: `SavedCandidate` is scoped per-recruiter, not shared company-wide

**Decision:** A saved candidate is private to the recruiter who saved them (`recruiterId` + `candidateId`, unique). There is no company-wide shared shortlist.

**Why:** The original feature spec lists "Save Candidates" under the _Recruiter_ module, not the _Company_ module — implying a personal shortlist, not team-shared. This keeps the initial feature simple and matches what was actually specified.

**Consequence:** If team-shared shortlists are wanted later, that's a genuine new feature (query by `companyId` instead of `recruiterId`, plus a UI to show "saved by [teammate]") — not a bug fix to the current design. Flagging this now so the distinction isn't lost later.

**Status:** Adopted.

---

## ADR-009: Notifications and ActivityLog use polymorphic references (`relatedEntityType`/`relatedEntityId`)

**Decision:** Rather than adding a separate optional reference field to `Notification`/`ActivityLog` for every entity type that might trigger one (`jobId?`, `applicationId?`, `companyId?`...), both collections use a single `{ type, id }` pair with a dynamic `refPath`.

**Why:** New notification- and log-triggering features will keep getting added over the project's life (AI features, admin actions, etc.). A rigid schema with one optional field per entity type would require a schema change for every new trigger. The polymorphic pair handles any future entity type without modification.

**Trade-off accepted:** Slightly less type-safety at the schema level (Mongoose can't statically know which model a given `relatedEntityId` points to) — acceptable given how much schema churn it avoids.

**Status:** Adopted.

---

## ADR-010: `ActivityLog` entries are immutable — updates are blocked at the schema level

**Decision:** A `pre` hook on `findOneAndUpdate`/`updateOne`/`updateMany` throws unconditionally for the `ActivityLog` model. Entries can only ever be inserted, never modified. There is no `deletedAt` — this collection isn't user-deletable through the app at all.

**Why:** The entire value of an audit log collection depends on entries being tamper-proof after the fact. Relying on "nobody will call `.update()` on this collection" as an informal convention is exactly the kind of thing that gets violated accidentally during a rushed bug fix six months in. Enforcing it at the schema level makes the invariant structural, not just a convention.

**Status:** Adopted.

---

## ADR-011: `Application.resumeSnapshotUrl` captures the resume at time of application, not a live reference

**Decision:** When a candidate applies, the resume URL is copied onto the `Application` document itself, rather than the application simply linking back to `CandidateProfile.resumeUrl`.

**Why:** If a candidate updates their resume after applying to a job, a recruiter reviewing that application later should see the resume that was actually submitted for that specific application — not a resume that's silently changed underneath them. This is a data-integrity decision, not just a convenience.

**Status:** Adopted.

---

## ADR-012: `AIReport` is schema-designed in Phase 1 but unused until Phase 5

**Decision:** The `AIReport` model was fully designed alongside the rest of Phase 1's core collections, including its `pending/completed/failed` status lifecycle anticipating the BullMQ queue introduced in Phase 4 — but no service, controller, or route touches it until Phase 5.

**Why:** Designing the shape now, while the rest of the schema and its patterns (polymorphic refs, denormalized counters, transaction-backed writes) are fresh, produces a more consistent result than improvising it later under the time pressure of "just get the AI feature working." This does not violate the "AI features built last" sequencing rule — no AI code is being written yet, only the data shape it will eventually use.

**Status:** Adopted.
