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

**Consequence:** `Job.createdBy` (once built) must be an independent, permanent reference — it must not be derived from the recruiter's *current* `companyId`, since that can change after the job was created.

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

**Status:** Adopted.
