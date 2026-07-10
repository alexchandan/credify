<!-- use markdown preview extension or tools for better experience-->

# Database Schema

MongoDB via Mongoose. This doc is the source of truth for collection shapes, relationships, and indexing decisions — update it whenever a model changes, in the same PR.

## Design Principles Applied Throughout

- **Identity vs. profile are separate.** `User` holds only auth-related fields. Domain data (name, skills, company) lives in role-specific profile collections.
- **Embed vs. reference is decided per-field, not by default:**
  - Embed when the data is always read together with its parent and doesn't need independent querying/pagination (e.g. education, experience inside `CandidateProfile`).
  - Reference when the data grows unbounded, is queried independently, or needs its own indexes (e.g. `Application`, `SavedCandidate`).
- **Soft delete everywhere it matters.** `deletedAt: Date | null` instead of hard deletes on `User`, `CandidateProfile`, `RecruiterProfile`, `Company`, and (once built) `Job`. Preserves history for applications, audit logs, and legal/data-retention reasons.
- **Every collection with a filterable field has that field indexed at design time**, not added reactively after a slow query in production.

---

## `users`

Identity only — no profile data.

| Field                                                     | Type                                    | Notes                                                         |
| --------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `email`                                                   | string                                  | unique, lowercase, indexed                                    |
| `passwordHash`                                            | string                                  | `select: false` — never returned by default                   |
| `role`                                                    | enum: `candidate`, `recruiter`, `admin` |                                                               |
| `isVerified`                                              | boolean                                 | default `false`                                               |
| `tokenVersion`                                            | number                                  | bumped to invalidate all refresh tokens ("logout everywhere") |
| `emailVerificationTokenHash` / `emailVerificationExpires` | string / Date                           | hashed at rest, never store raw tokens                        |
| `passwordResetTokenHash` / `passwordResetExpires`         | string / Date                           | hashed at rest                                                |
| `deletedAt`                                               | Date \| null                            | soft delete                                                   |

**Indexes:** `email` (unique), `deletedAt`

**Relationships:** Referenced by `CandidateProfile.userId` and `RecruiterProfile.userId` (one-to-one, each).

---

## `candidateProfiles`

| Field            | Type                                                                 | Notes                                               |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `userId`         | ObjectId → User                                                      | unique — one profile per user                       |
| `fullName`       | string                                                               | required                                            |
| `headline`       | string                                                               | max 150 chars                                       |
| `skills`         | string[]                                                             | normalized to lowercase/trimmed on write            |
| `location`       | string                                                               |                                                     |
| `availability`   | enum: `immediate`, `within_2_weeks`, `within_1_month`, `not_looking` |                                                     |
| `resumeUrl`      | string                                                               | Cloudinary URL                                      |
| `education`      | IEducation[]                                                         | **embedded**, `_id: false`                          |
| `experience`     | IExperience[]                                                        | **embedded**, `_id: false`                          |
| `projects`       | IProject[]                                                           | **embedded**, `_id: false`                          |
| `certifications` | ICertification[]                                                     | **embedded**, `_id: false`                          |
| `socialLinks`    | object                                                               | **embedded** — linkedin, github, portfolio, twitter |
| `deletedAt`      | Date \| null                                                         | soft delete                                         |

**Indexes:** `userId` (unique), `skills` (multikey), `location`, `availability`, `deletedAt`

**Why embedded sub-documents:** education/experience/projects/certifications are always displayed and edited together with the profile as a whole — they never need independent pagination or cross-candidate querying. Embedding avoids unnecessary joins ($lookup) on every profile read.

---

## `recruiterProfiles`

| Field         | Type                                     | Notes                                                                 |
| ------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `userId`      | ObjectId → User                          | unique — one profile per user                                         |
| `fullName`    | string                                   | required                                                              |
| `title`       | string                                   | job title, optional                                                   |
| `companyId`   | ObjectId → Company \| null               | null until they create/join a company                                 |
| `companyRole` | enum: `owner`, `admin`, `member` \| null | must be null iff `companyId` is null (enforced via `pre('validate')`) |
| `deletedAt`   | Date \| null                             | soft delete                                                           |

**Indexes:** `userId` (unique), `companyId`, `deletedAt`

**Relationship model:** One recruiter belongs to **at most one company at a time** (see Decision Record ADR-004). Recruiters can switch companies over time by updating `companyId`/`companyRole` — this does **not** retroactively change authorship on jobs they already created (see `Job.createdBy`, once that model is built).

---

## `companies`

| Field         | Type                                                 | Notes                                                            |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| `name`        | string                                               | required                                                         |
| `slug`        | string                                               | unique, lowercase — used in public URLs (`/companies/acme-corp`) |
| `description` | string                                               | max 3000 chars                                                   |
| `industry`    | string                                               |                                                                  |
| `logoUrl`     | string                                               | Cloudinary URL                                                   |
| `website`     | string                                               |                                                                  |
| `size`        | enum: `1-10`, `11-50`, `51-200`, `201-1000`, `1000+` |                                                                  |
| `createdBy`   | ObjectId → RecruiterProfile                          | permanent record of who created the company                      |
| `deletedAt`   | Date \| null                                         | soft delete                                                      |

**Indexes:** `slug` (unique), `name` (text index — fallback search before Atlas Search is introduced), `deletedAt`

**Relationship model:** One company has many `RecruiterProfile`s (queried via `RecruiterProfile.find({ companyId })`, not via an array on `Company` — see ADR-003 for why).

---

## `jobs`

| Field                     | Type                                                     | Notes                                                                                  |
| ------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `companyId`               | ObjectId → Company                                       | required                                                                               |
| `createdBy`               | ObjectId → RecruiterProfile                              | `immutable` — permanent authorship, independent of the recruiter's _current_ company   |
| `title`                   | string                                                   | required, max 150 chars                                                                |
| `description`             | string                                                   | required, max 10,000 chars                                                             |
| `status`                  | enum: `draft`, `published`, `closed`                     | default `draft`                                                                        |
| `employmentType`          | enum: `full_time`, `part_time`, `contract`, `internship` | required                                                                               |
| `experienceLevel`         | enum: `entry`, `mid`, `senior`, `lead`                   | required                                                                               |
| `skillsRequired`          | string[]                                                 | normalized to lowercase/trimmed on write                                               |
| `location`                | string                                                   |                                                                                        |
| `isRemote`                | boolean                                                  | default `false`                                                                        |
| `salaryRange`             | object \| undefined                                      | **embedded** — min, max, currency; optional (recruiter may not disclose)               |
| `publishedAt`             | Date \| null                                             | auto-stamped the moment `status` becomes `published`                                   |
| `applicationCount`        | number                                                   | **denormalized counter** — avoids a COUNT query against `applications` on every render |
| `isDeleted` / `deletedAt` | boolean / Date \| null                                   | soft delete                                                                            |

**Indexes:** `(companyId, status)`, `(status, publishedAt desc)`, `skillsRequired` (multikey), `location`, `createdBy`, `isDeleted`, text index on `(title, description)`

**Relationships:** Belongs to one `Company` and one `RecruiterProfile` (author). Has many `Application`s.

**Business rule (enforced in service layer, not schema):** the recruiter in `createdBy` must belong to `companyId` at creation time — see the permission/policy layer.

---

## `applications`

| Field               | Type                                                                             | Notes                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `candidateId`       | ObjectId → CandidateProfile                                                      | required                                                                                                         |
| `jobId`             | ObjectId → Job                                                                   | required, `immutable`                                                                                            |
| `companyId`         | ObjectId → Company                                                               | **denormalized from Job** — enables cheap "all applications across my company" queries without a `$lookup`       |
| `status`            | enum: `applied`, `under_review`, `shortlisted`, `rejected`, `hired`, `withdrawn` | default `applied`                                                                                                |
| `resumeSnapshotUrl` | string                                                                           | required — resume as it existed **at the moment of applying**, not a live link to the candidate's current resume |
| `coverLetter`       | string                                                                           | optional, max 3000 chars                                                                                         |
| `statusHistory`     | IStatusHistoryEntry[]                                                            | **embedded**, append-only audit log of every status transition (status, changedAt, changedBy)                    |

**Indexes:** `(candidateId, jobId)` unique — one application per candidate per job; `(jobId, status)`; `(candidateId, createdAt desc)`; `(companyId, status)`

**Relationships:** Belongs to one `CandidateProfile` and one `Job`.

**No `isDeleted`/soft delete on this collection** — withdrawal is a `status` value (`withdrawn`), not a deletion. The application's existence is itself the audit trail.

**Requires a transaction** (see ADR-007): creating an application must atomically (1) insert the `Application`, (2) increment `Job.applicationCount`, (3) create a `Notification` for the recruiter.

---

## `savedCandidates`

| Field         | Type                        | Notes                                                    |
| ------------- | --------------------------- | -------------------------------------------------------- |
| `recruiterId` | ObjectId → RecruiterProfile | required                                                 |
| `candidateId` | ObjectId → CandidateProfile | required                                                 |
| `note`        | string                      | optional, max 1000 chars — private note to the recruiter |

**Indexes:** `(recruiterId, candidateId)` unique; `(recruiterId, createdAt desc)`

**Relationships:** Scoped to the individual recruiter, not shared company-wide (see ADR-008).

---

## `notifications`

| Field               | Type                                                                                           | Notes                                               |
| ------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `userId`            | ObjectId → User                                                                                | required — the recipient                            |
| `type`              | enum: `application_received`, `application_status_changed`, `job_published`, `candidate_saved` |                                                     |
| `message`           | string                                                                                         | required, max 300 chars                             |
| `relatedEntityType` | enum: `Job`, `Application`, `CandidateProfile`                                                 | optional, polymorphic ref discriminator             |
| `relatedEntityId`   | ObjectId                                                                                       | optional, resolved via `refPath: relatedEntityType` |
| `isRead`            | boolean                                                                                        | default `false`                                     |
| `readAt`            | Date \| null                                                                                   | auto-stamped when `isRead` flips to `true`          |

**Indexes:** `(userId, isRead, createdAt desc)` — the core "unread notifications, newest first" dashboard query; `(userId, createdAt desc)` for full history

**Relationships:** Polymorphic reference to whatever triggered it (see ADR-009).

---

## `activityLogs`

| Field        | Type                                                                             | Notes                                                     |
| ------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `actorId`    | ObjectId → User                                                                  | required, `immutable` — who performed the action          |
| `action`     | enum (e.g. `job_published`, `user_moderated`, `application_status_changed`, ...) | required, `immutable`                                     |
| `targetType` | enum: `User`, `Company`, `Job`, `Application`, `RecruiterProfile`                | required, `immutable`, polymorphic discriminator          |
| `targetId`   | ObjectId                                                                         | required, `immutable`, resolved via `refPath: targetType` |
| `metadata`   | Mixed                                                                            | optional, `immutable` — flexible context per action type  |
| `ipAddress`  | string                                                                           | optional, `immutable`                                     |

**Indexes:** `(actorId, createdAt desc)`; `(targetType, targetId, createdAt desc)`; `(action, createdAt desc)`

**Immutability enforced at the schema level** — a `pre` hook throws on any `findOneAndUpdate`/`updateOne`/`updateMany` against this collection (see ADR-010). No `deletedAt` — this collection isn't user-deletable at all.

---

## `aiReports`

_Schema designed in Phase 1 for consistency; unused by any service or route until Phase 5, per the "AI features last" sequencing rule._

| Field         | Type                                                                            | Notes                                                                            |
| ------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `candidateId` | ObjectId → CandidateProfile                                                     | required                                                                         |
| `jobId`       | ObjectId → Job                                                                  | required **only** for `candidate_match` reports (enforced via `pre('validate')`) |
| `type`        | enum: `resume_parse`, `resume_review`, `candidate_match`, `profile_improvement` | required, `immutable`                                                            |
| `status`      | enum: `pending`, `completed`, `failed`                                          | default `pending` — reflects the BullMQ job lifecycle                            |
| `result`      | Mixed                                                                           | optional — shape varies per `type`                                               |
| `error`       | string                                                                          | optional — failure detail, kept separate from `result`                           |
| `requestedBy` | ObjectId → User                                                                 | required, `immutable` — candidate themself, or a recruiter (for matching)        |

**Indexes:** `(candidateId, type, createdAt desc)`; `(jobId, type)`; `status`

**Relationships:** Belongs to one `CandidateProfile`; optionally one `Job`.

---

## All Core Collections: Status

Every collection from the original design table is now modeled: `users`, `candidateProfiles`, `recruiterProfiles`, `companies`, `jobs`, `applications`, `savedCandidates`, `notifications`, `activityLogs`, `aiReports`. Phase 1 schema design is complete.
