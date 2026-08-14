# Database Schema

Credify uses MongoDB through Mongoose. This document describes the schema that
is actually defined under `server/src/models`, including embedded documents,
indexes, lifecycle hooks, and current implementation caveats.

## Conventions

- MongoDB references use `ObjectId` and Mongoose model names.
- `timestamps: true` adds `createdAt` and `updatedAt` unless stated otherwise.
- Identity is stored separately from candidate/recruiter domain profiles.
- Bounded data that is always edited with its parent is embedded.
- Independently queried or unbounded data uses its own collection.
- Most core entities are soft-deleted; each query must explicitly apply the
  corresponding active-record filter.
- `unique` is a database index constraint, not a Mongoose validator. Services
  translate expected duplicate-key failures into domain errors.

## Relationship Summary

```text
User
├── 1 CandidateProfile
└── 1 RecruiterProfile ── 0..1 Company
                              └── many Job

CandidateProfile ── many Application ── 1 Job
RecruiterProfile ── many SavedCandidate ── 1 CandidateProfile
User ── many Notification
User ── many ActivityLog (actor)
CandidateProfile ── many AIReport ── 0..1 Job
```

The arrows describe application-level relationships. MongoDB does not enforce
foreign-key existence automatically.

## `users`

Model: `User`

| Field                          | Type                                  | Required/default          | Notes                                                                               |
| ------------------------------ | ------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `email`                        | string                                | Required                  | Trimmed, lowercased, 3-50 characters, email-pattern validation                      |
| `passwordHash`                 | string                                | Required                  | `select: false`; raw passwords are assigned here and hashed by a `pre("save")` hook |
| `role`                         | `candidate` \| `recruiter` \| `admin` | Default `candidate`       | Authentication/authorization role                                                   |
| `isVerified`                   | boolean                               | Default `false`           | Email-verification state                                                            |
| `tokenVersion`                 | number                                | Default `0`               | Compared by refresh flow; incrementing revokes existing refresh tokens              |
| `emailVerificationTokenHash`   | string                                | Optional, `select: false` | SHA-256 hash; raw token is emailed                                                  |
| `emailVerificationTokenExpiry` | Date                                  | Optional, `select: false` | Verification deadline                                                               |
| `passwordResetTokenHash`       | string                                | Optional, `select: false` | SHA-256 hash; raw token is emailed                                                  |
| `passwordResetTokenExpiry`     | Date                                  | Optional, `select: false` | Reset deadline                                                                      |
| `deletedAt`                    | Date \| null                          | Default `null`            | User/account soft deletion and admin suspension                                     |

Indexes:

- `{ email: 1 }`, unique only for documents where `deletedAt: null`
- `{ deletedAt: 1 }`

Hooks/methods:

- `pre("save")` hashes a modified `passwordHash` with bcrypt cost 12.
- `comparePassword(password)` compares a candidate password with the stored
  hash.

Relationships:

- One active user normally has one role-specific profile.
- `Notification.userId`, `ActivityLog.actorId`, and `AIReport.requestedBy`
  reference this model.

## `candidateProfiles`

Model: `CandidateProfile`

| Field              | Type              | Required/default      | Notes                                                       |
| ------------------ | ----------------- | --------------------- | ----------------------------------------------------------- |
| `userId`           | ObjectId -> User  | Required, unique      | One-to-one identity link                                    |
| `fullName`         | string            | Required              | Trimmed                                                     |
| `headline`         | string            | Optional              | Trimmed, persisted maximum 200; API currently limits to 150 |
| `skills`           | string[]          | Default `[]`          | Each value is trimmed and lowercased on assignment          |
| `location`         | string            | Optional              | Trimmed                                                     |
| `availability`     | Availability enum | Default `not_looking` | See values below                                            |
| `avatarUrl`        | string            | Optional              | Cloudinary secure image URL                                 |
| `avatarPublicId`   | string            | Optional              | Cloudinary deletion/replacement identifier                  |
| `avatarUploadedAt` | Date              | Optional              | Time of latest successful avatar upload                     |
| `resumeUrl`        | string            | Optional              | Cloudinary secure URL                                       |
| `resumePublicId`   | string            | Optional              | Cloudinary deletion/replacement identifier                  |
| `resumeUploadedAt` | Date              | Optional              | Time of latest successful upload                            |
| `education`        | Education[]       | Default `[]`          | Embedded, no subdocument `_id`                              |
| `experience`       | Experience[]      | Default `[]`          | Embedded, no subdocument `_id`                              |
| `projects`         | Project[]         | Default `[]`          | Embedded, no subdocument `_id`                              |
| `certifications`   | Certification[]   | Default `[]`          | Embedded, no subdocument `_id`                              |
| `socialLinks`      | SocialLinks       | Default `{}`          | Embedded, no subdocument `_id`                              |
| `deletedAt`        | Date \| null      | Default `null`        | Profile soft deletion                                       |

Availability values:

- `immediate`
- `within_two_weeks`
- `within_one_month`
- `not_looking`

Embedded shapes:

| Shape         | Fields                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| Education     | `institution`, `degree`, `fieldOfStudy?`, `startDate`, `endDate?`, `grade?`          |
| Experience    | `company`, `title`, `startDate`, `endDate?`, `isCurrent`, `description?` (max 2,000) |
| Project       | `title`, `description?` (max 2,000), `techStack[]`, `link?`                          |
| Certification | `name`, `issuingOrg`, `issueDate`, `expiryDate?`, `credentialUrl?`                   |
| SocialLinks   | `linkedIn?`, `github?`, `portfolio?`, `twitter?`                                     |

Indexes:

- Inline unique index on `userId`
- `{ skills: 1 }` (multikey)
- `{ location: 1 }`
- `{ availability: 1 }`
- `{ deletedAt: 1 }`

## `recruiterProfiles`

Model: `RecruiterProfile`

| Field         | Type                        | Required/default | Notes                                      |
| ------------- | --------------------------- | ---------------- | ------------------------------------------ |
| `userId`      | ObjectId -> User            | Required, unique | One-to-one identity link                   |
| `fullName`    | string                      | Required         | Trimmed                                    |
| `title`       | string                      | Optional         | Trimmed                                    |
| `companyId`   | ObjectId -> Company \| null | Default `null`   | A recruiter belongs to at most one company |
| `companyRole` | CompanyRole \| null         | Default `null`   | `owner`, `admin`, or `member`              |
| `deletedAt`   | Date \| null                | Default `null`   | Profile soft deletion                      |

The `pre("validate")` hook enforces that `companyId` and `companyRole` are set
or cleared together.

Indexes:

- Inline unique index on `userId`
- `{ companyId: 1 }`
- `{ deletedAt: 1 }`

`companyId` is the source of truth for membership. `Company` does not duplicate
membership in an array.

## `companies`

Model: `Company`

| Field          | Type                         | Required/default | Notes                                             |
| -------------- | ---------------------------- | ---------------- | ------------------------------------------------- |
| `name`         | string                       | Required         | Trimmed, 2-100 characters                         |
| `slug`         | string                       | Required         | Lowercased, trimmed, generated at creation        |
| `description`  | string                       | Optional         | Trimmed, maximum 3,000                            |
| `industry`     | string                       | Optional         | Trimmed                                           |
| `logoUrl`      | string                       | Optional         | Cloudinary secure URL                             |
| `logoPublicId` | string                       | Optional         | Cloudinary replacement/deletion identifier        |
| `websiteUrl`   | string                       | Optional         | Trimmed; API validates URL syntax                 |
| `size`         | CompanySize                  | Optional         | `1-10`, `11-50`, `51-200`, `201-1000`, or `1000+` |
| `createdBy`    | ObjectId -> RecruiterProfile | Required         | Recruiter profile that created the company        |
| `deletedAt`    | Date \| null                 | Default `null`   | Company soft deletion                             |

Indexes:

- `{ slug: 1 }`, unique only where `deletedAt: null`
- `{ name: "text" }`
- `{ deletedAt: 1 }`

The generic company update does not regenerate `slug`, preserving existing
public links after a display-name change.

## `jobs`

Model: `Job`

| Field              | Type                         | Required/default    | Notes                                                                                 |
| ------------------ | ---------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `companyId`        | ObjectId -> Company          | Required            | Owning company                                                                        |
| `createdBy`        | ObjectId -> RecruiterProfile | Required, immutable | Permanent author record                                                               |
| `title`            | string                       | Required            | Trimmed, maximum 150                                                                  |
| `description`      | string                       | Required            | Trimmed, maximum 1,000                                                                |
| `status`           | JobStatus                    | Default `draft`     | `draft`, `published`, or `closed`                                                     |
| `employmentType`   | EmploymentType               | Required            | `full_time`, `part_time`, `contract`, or `internship`                                 |
| `experienceLevel`  | ExperienceLevel              | Required            | `entry`, `mid`, `senior`, or `lead`                                                   |
| `skillsRequired`   | string[]                     | Default `[]`        | Trimmed and lowercased on assignment                                                  |
| `location`         | string[]                     | Default `[]`        | Each location is trimmed and lowercased                                               |
| `isRemote`         | boolean                      | Default `false`     | Remote-work flag                                                                      |
| `salaryRange`      | SalaryRange                  | Optional            | Embedded `{ min?, max?, currency }`; non-negative numbers; currency defaults to `INR` |
| `publishedAt`      | Date \| null                 | Default `null`      | Stamped on first transition to `published`                                            |
| `applicationCount` | number                       | Default `0`         | Denormalized, non-negative application count                                          |
| `isDeleted`        | boolean                      | Default `false`     | Current persisted soft-delete flag                                                    |

Indexes:

- `{ companyId: 1, status: 1 }`
- `{ status: 1, publishedAt: -1 }`
- `{ skillsRequired: 1 }` (multikey)
- `{ location: 1 }`
- `{ createdBy: 1 }`
- `{ isDeleted: 1 }`
- Text index on `{ title: "text", description: "text" }`

Implementation caveat: `IJob` and deletion services currently refer to
`deletedAt`, but `deletedAt` is absent from the Mongoose schema. With Mongoose's
strict schema behavior, assigning it does not persist it. `isDeleted` is the
effective deletion field until the schema is fixed; see
[Project Status](./PROJECT_STATUS.md).

## `applications`

Model: `Application`

| Field               | Type                         | Required/default    | Notes                                 |
| ------------------- | ---------------------------- | ------------------- | ------------------------------------- |
| `candidateId`       | ObjectId -> CandidateProfile | Required            | Candidate profile owner               |
| `jobId`             | ObjectId -> Job              | Required, immutable | Application target                    |
| `companyId`         | ObjectId -> Company          | Required, immutable | Denormalized for company-wide queries |
| `status`            | ApplicationStatus            | Default `applied`   | See lifecycle values below            |
| `resumeSnapshotUrl` | string                       | Required            | Resume URL copied at application time |
| `coverLetter`       | string                       | Optional            | Trimmed, maximum 3,000                |
| `statusHistory`     | StatusHistoryEntry[]         | Default `[]`        | Embedded status audit history         |

Status values:

- `applied`
- `under_review`
- `shortlisted`
- `rejected`
- `hired`
- `withdrawn`

Each status-history entry contains:

| Field       | Type              | Notes                                       |
| ----------- | ----------------- | ------------------------------------------- |
| `status`    | ApplicationStatus | State recorded by the change                |
| `changedAt` | Date              | Defaults to current time                    |
| `changedBy` | ObjectId -> User  | Candidate or recruiter user that changed it |

Indexes:

- `{ candidateId: 1, jobId: 1 }`, unique
- `{ jobId: 1, status: 1 }`
- `{ candidateId: 1, createdAt: -1 }`
- `{ companyId: 1, status: 1 }`

A `pre("save")` hook appends status history whenever a new application is
saved or its status changes. The service must set the transient
`_statusChangedBy` value before saving; absence is treated as a programmer
invariant failure.

Applications are not soft-deleted. Candidate withdrawal is represented by the
`withdrawn` status, preserving the application audit trail.

## `savedCandidates`

Model: `SavedCandidate`

| Field         | Type                         | Required/default | Notes                                               |
| ------------- | ---------------------------- | ---------------- | --------------------------------------------------- |
| `recruiterId` | ObjectId -> RecruiterProfile | Required         | Owning recruiter; records are private per recruiter |
| `candidateId` | ObjectId -> CandidateProfile | Required         | Saved candidate                                     |
| `note`        | string                       | Optional         | Trimmed, maximum 1,000                              |

Indexes:

- `{ recruiterId: 1, candidateId: 1 }`, unique
- `{ recruiterId: 1, createdAt: -1 }`

Unsaving hard-deletes this relationship record; it does not delete the
candidate.

## `notifications`

Model: `Notification`

| Field               | Type                   | Required/default | Notes                                       |
| ------------------- | ---------------------- | ---------------- | ------------------------------------------- |
| `userId`            | ObjectId -> User       | Required         | Recipient                                   |
| `type`              | NotificationType       | Required         | See values below                            |
| `message`           | string                 | Required         | Trimmed, maximum 300                        |
| `relatedEntityType` | RelatedEntityType      | Optional         | `Job`, `Application`, or `CandidateProfile` |
| `relatedEntityId`   | ObjectId via `refPath` | Optional         | Resolves using `relatedEntityType`          |
| `isRead`            | boolean                | Default `false`  | Read state                                  |
| `readAt`            | Date \| null           | Default `null`   | Set by save hook or bulk read action        |

Notification types:

- `application_received`
- `application_status_changed`
- `job_published`
- `candidate_saved`

Only the first two types are currently created by services.

Indexes:

- `{ userId: 1, isRead: 1, createdAt: -1 }`
- `{ userId: 1, createdAt: -1 }`

When an individual document becomes read, `pre("save")` stamps `readAt` if it
is absent. The bulk mark-all service sets both fields directly because update
queries do not run document save hooks.

## `activityLogs`

Model: `ActivityLog`

| Field        | Type                   | Required/default    | Notes                       |
| ------------ | ---------------------- | ------------------- | --------------------------- |
| `actorId`    | ObjectId -> User       | Required, immutable | Actor that caused the event |
| `action`     | ActivityAction         | Required, immutable | Audit action enum           |
| `targetType` | ActivityTargetType     | Required, immutable | Mongoose model name         |
| `targetId`   | ObjectId via `refPath` | Required, immutable | Resolves using `targetType` |
| `metadata`   | Mixed                  | Optional, immutable | Action-specific context     |
| `ipAddress`  | string                 | Optional, immutable | Optional actor IP           |
| `createdAt`  | Date                   | Automatic           | No `updatedAt` field        |

Action values currently modeled:

- `user_registered`
- `user_moderated`
- `company_created`
- `company_updated`
- `company_deleted`
- `job_published`
- `job_closed`
- `job_deleted`
- `application_status_changed`
- `recruiter_removed_from_company`

Target values are `User`, `Company`, `Job`, `Application`, and
`RecruiterProfile`.

Indexes:

- `{ actorId: 1, createdAt: -1 }`
- `{ targetType: 1, targetId: 1, createdAt: -1 }`
- `{ action: 1, createdAt: -1 }`

The schema blocks `findOneAndUpdate`, `updateOne`, and `updateMany`. Fields are
also declared immutable. Current services write activity logs only for admin
user moderation and admin company/job deletion.

## `aiReports`

Model: `AIReport`

| Field         | Type                         | Required/default    | Notes                                                                 |
| ------------- | ---------------------------- | ------------------- | --------------------------------------------------------------------- |
| `candidateId` | ObjectId -> CandidateProfile | Required            | Report subject                                                        |
| `jobId`       | ObjectId -> Job              | Conditional         | Required only for `candidate_match`; forbidden for other report types |
| `type`        | AIReportType                 | Required, immutable | See values below                                                      |
| `status`      | AIReportStatus               | Default `pending`   | `pending`, `completed`, or `failed`                                   |
| `result`      | Mixed                        | Optional            | Type-specific result payload                                          |
| `error`       | string                       | Optional            | Worker/provider failure detail                                        |
| `requestedBy` | ObjectId -> User             | Required, immutable | User that requested the report                                        |

Report types:

- `resume_parse`
- `resume_review`
- `candidate_match`
- `profile_improvement`

Indexes:

- `{ candidateId: 1, type: 1, createdAt: -1 }`
- `{ jobId: 1, type: 1 }`
- `{ status: 1 }`

The schema is present, but no service, controller, route, queue worker, AI
provider, or frontend workflow uses it yet.

## Deletion Behavior

| Model            | Current deletion representation                                   |
| ---------------- | ----------------------------------------------------------------- |
| User             | `deletedAt`                                                       |
| CandidateProfile | `deletedAt`                                                       |
| RecruiterProfile | `deletedAt`                                                       |
| Company          | `deletedAt`                                                       |
| Job              | `isDeleted`; intended `deletedAt` assignment is not persisted yet |
| Application      | Lifecycle status; no delete endpoint                              |
| SavedCandidate   | Hard-deleted relationship record                                  |
| Notification     | No delete endpoint                                                |
| ActivityLog      | Immutable/no delete endpoint                                      |
| AIReport         | No delete endpoint                                                |

Soft-delete scoping is explicit in service queries rather than automatic query
middleware. Any new query must deliberately decide whether deleted records are
included.
