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

| Field | Type | Notes |
|---|---|---|
| `email` | string | unique, lowercase, indexed |
| `passwordHash` | string | `select: false` — never returned by default |
| `role` | enum: `candidate`, `recruiter`, `admin` | |
| `isVerified` | boolean | default `false` |
| `tokenVersion` | number | bumped to invalidate all refresh tokens ("logout everywhere") |
| `emailVerificationTokenHash` / `emailVerificationExpires` | string / Date | hashed at rest, never store raw tokens |
| `passwordResetTokenHash` / `passwordResetExpires` | string / Date | hashed at rest |
| `deletedAt` | Date \| null | soft delete |

**Indexes:** `email` (unique), `deletedAt`

**Relationships:** Referenced by `CandidateProfile.userId` and `RecruiterProfile.userId` (one-to-one, each).

---

## `candidateProfiles`

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | unique — one profile per user |
| `fullName` | string | required |
| `headline` | string | max 150 chars |
| `skills` | string[] | normalized to lowercase/trimmed on write |
| `location` | string | |
| `availability` | enum: `immediate`, `within_2_weeks`, `within_1_month`, `not_looking` | |
| `resumeUrl` | string | Cloudinary URL |
| `education` | IEducation[] | **embedded**, `_id: false` |
| `experience` | IExperience[] | **embedded**, `_id: false` |
| `projects` | IProject[] | **embedded**, `_id: false` |
| `certifications` | ICertification[] | **embedded**, `_id: false` |
| `socialLinks` | object | **embedded** — linkedin, github, portfolio, twitter |
| `deletedAt` | Date \| null | soft delete |

**Indexes:** `userId` (unique), `skills` (multikey), `location`, `availability`, `deletedAt`

**Why embedded sub-documents:** education/experience/projects/certifications are always displayed and edited together with the profile as a whole — they never need independent pagination or cross-candidate querying. Embedding avoids unnecessary joins ($lookup) on every profile read.

---

## `recruiterProfiles`

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | unique — one profile per user |
| `fullName` | string | required |
| `title` | string | job title, optional |
| `companyId` | ObjectId → Company \| null | null until they create/join a company |
| `companyRole` | enum: `owner`, `admin`, `member` \| null | must be null iff `companyId` is null (enforced via `pre('validate')`) |
| `deletedAt` | Date \| null | soft delete |

**Indexes:** `userId` (unique), `companyId`, `deletedAt`

**Relationship model:** One recruiter belongs to **at most one company at a time** (see Decision Record ADR-004). Recruiters can switch companies over time by updating `companyId`/`companyRole` — this does **not** retroactively change authorship on jobs they already created (see `Job.createdBy`, once that model is built).

---

## `companies`

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `slug` | string | unique, lowercase — used in public URLs (`/companies/acme-corp`) |
| `description` | string | max 3000 chars |
| `industry` | string | |
| `logoUrl` | string | Cloudinary URL |
| `website` | string | |
| `size` | enum: `1-10`, `11-50`, `51-200`, `201-1000`, `1000+` | |
| `createdBy` | ObjectId → RecruiterProfile | permanent record of who created the company |
| `deletedAt` | Date \| null | soft delete |

**Indexes:** `slug` (unique), `name` (text index — fallback search before Atlas Search is introduced), `deletedAt`

**Relationship model:** One company has many `RecruiterProfile`s (queried via `RecruiterProfile.find({ companyId })`, not via an array on `Company` — see ADR-003 for why).

---

## Pending Collections (Not Yet Designed)

| Collection | Depends on |
|---|---|
| `jobs` | `Company`, `RecruiterProfile` |
| `applications` | `CandidateProfile`, `Job` |
| `savedCandidates` | `RecruiterProfile`, `CandidateProfile` |
| `notifications` | `User` |
| `activityLogs` | `User` (actor) |
| `aiReports` | `CandidateProfile`, `Job` (Phase 5) |

This section should be updated (row removed, model documented above) as each is designed.
