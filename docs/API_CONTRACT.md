# API Contract

This document describes the API mounted by `server/src/app.ts`. It is the
source of truth for response envelopes, authentication conventions, request
validation, error codes, and the current REST surface.

The API base URL is `/api/v1`. The health endpoint is mounted at `/health`.

## Response Envelopes

Controllers send responses through `sendSuccess()` and the global error
handler sends failures through `sendError()`. Controllers must not call
`res.json()` directly.

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed",
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 47,
    "totalPages": 3
  }
}
```

- `data` is the resource payload and is `null` when no payload is useful.
- `message` is always present, although it may be an empty string.
- `meta` is optional and is used for pagination or related counts.

### Error

```json
{
  "success": false,
  "error": {
    "code": "JOB_404",
    "message": "Job not found",
    "details": []
  }
}
```

- `code` is the stable value clients should branch on.
- `message` is safe to display to a user.
- `details` is always an array. Zod validation errors use strings in the form
  `field.path: message`.

## HTTP Status Codes

| Status | Use                                                       |
| ------ | --------------------------------------------------------- |
| `200`  | Successful read, update, delete, or action                |
| `201`  | A resource was created                                    |
| `400`  | Request validation, model validation, or upload failure   |
| `401`  | Authentication is missing, invalid, expired, or revoked   |
| `403`  | The authenticated role or actor cannot perform the action |
| `404`  | The resource or route is not visible/found                |
| `409`  | Duplicate data or an invalid state transition             |
| `429`  | A rate limit was exceeded                                 |
| `500`  | An unexpected server failure                              |

## Authentication

Protected routes expect an access token in this header:

```http
Authorization: Bearer <access-token>
```

Access tokens last 15 minutes and contain `userId` and `role`. Refresh tokens
last 30 days and contain `userId` and `tokenVersion`.

The refresh token is stored in the `refreshToken` cookie with these options:

- HTTP-only
- `SameSite=Strict`
- `Secure` in production
- path `/api/v1/auth`
- maximum age 30 days

`POST /auth/refresh` rotates the access/refresh pair. Rotation currently does
not blacklist the refresh token that was just consumed; see ADR-014 and
[Project Status](./PROJECT_STATUS.md).

`GET /jobs/:id` uses optional authentication. Published and closed jobs are
public; drafts return `404` to anonymous/unauthorized actors and are visible
only to a recruiter accepted by the job policy.

## Rate Limits

All requests share a global limit of 300 requests per 15 minutes per resolved
client IP. These sensitive auth endpoints additionally allow 10 requests per
15 minutes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/change-password`
- `DELETE /auth/delete-account`

Rate-limit failures use `429 RATE_LIMITED` and standard rate-limit response
headers.

## Pagination

Paginated endpoints accept:

| Parameter | Default | Constraint                    |
| --------- | ------- | ----------------------------- |
| `page`    | `1`     | Integer, minimum `1`          |
| `limit`   | `20`    | Integer from `1` through `50` |

Their `meta` object includes `page`, `limit`, `totalCount`, and `totalPages`.
Notification lists also include `unreadCount`.

## Endpoint Reference

In the tables below, `candidate`, `recruiter`, and `admin` refer to the role in
the verified access token. Resource policies may impose stricter ownership or
company-membership checks after the role gate.

### Service

| Method | Path      | Access | Result                     |
| ------ | --------- | ------ | -------------------------- |
| `GET`  | `/health` | Public | `{ status: "ok", uptime }` |
| `GET`  | `/api/v1` | Public | API identity response      |

### Authentication: `/api/v1/auth`

| Method   | Path                   | Access                      | Input                                 | Result/side effect                                                                               |
| -------- | ---------------------- | --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `POST`   | `/register`            | Public, rate-limited        | `{ email, password, fullName, role }` | Creates a user and role profile in a transaction; returns `{ userId }`; sends verification email |
| `POST`   | `/login`               | Public, rate-limited        | `{ email, password }`                 | Sets refresh cookie; returns `{ accessToken, user }`                                             |
| `POST`   | `/refresh`             | Refresh cookie              | None                                  | Rotates cookie; returns `{ accessToken }`                                                        |
| `POST`   | `/logout`              | Public                      | None                                  | Clears refresh cookie                                                                            |
| `POST`   | `/logout-everywhere`   | Authenticated               | None                                  | Increments `tokenVersion` and clears refresh cookie                                              |
| `POST`   | `/verify-email`        | Public                      | `{ token }`                           | Marks a matching account verified and consumes the token                                         |
| `POST`   | `/resend-verification` | Public, rate-limited        | `{ email }`                           | Enumeration-safe resend; always returns the same success shape                                   |
| `POST`   | `/forgot-password`     | Public, rate-limited        | `{ email }`                           | Enumeration-safe reset request; token expires in 30 minutes                                      |
| `POST`   | `/reset-password`      | Public                      | `{ token, newPassword }`              | Changes password, consumes reset token, increments `tokenVersion`                                |
| `GET`    | `/me`                  | Authenticated               | None                                  | `{ id, email, role, isVerified }`                                                                |
| `POST`   | `/change-password`     | Authenticated, rate-limited | `{ currentPassword, newPassword }`    | Changes password, increments `tokenVersion`, returns a fresh token/user pair, rotates cookie     |
| `DELETE` | `/delete-account`      | Authenticated, rate-limited | `{ password }`                        | Soft-deletes user and matching candidate/recruiter profile; clears refresh cookie                |

Registration accepts only `candidate` and `recruiter`. Password constraints are
8-15 characters for registration, reset, and authenticated password changes.

### Candidates: `/api/v1/candidates`

| Method   | Path         | Access             | Input                     | Result                                          |
| -------- | ------------ | ------------------ | ------------------------- | ----------------------------------------------- |
| `GET`    | `/me`        | Candidate          | None                      | Current candidate profile                       |
| `PATCH`  | `/me`        | Candidate          | Partial candidate profile | Updated candidate profile                       |
| `POST`   | `/me/avatar` | Candidate          | Multipart field `avatar`  | Updated profile with Cloudinary avatar metadata |
| `DELETE` | `/me/avatar` | Candidate          | None                      | Updated profile without avatar metadata         |
| `POST`   | `/me/resume` | Candidate          | Multipart field `resume`  | Updated profile with Cloudinary resume metadata |
| `DELETE` | `/me/resume` | Candidate          | None                      | Updated profile without resume metadata         |
| `GET`    | `/:id`       | Recruiter or admin | Candidate profile ID      | Candidate profile                               |

Candidate profile input fields:

- `fullName`: non-empty, maximum 150
- `headline`: maximum 150
- `skills`: string array
- `location`: optional string
- `availability`: `immediate`, `within_two_weeks`, `within_one_month`, or
  `not_looking`
- `education`: embedded education array
- `experience`: embedded experience array
- `projects`: embedded project array
- `certifications`: embedded certification array
- `socialLinks`: optional URL fields `linkedIn`, `github`, `portfolio`, and
  `twitter`

Resume uploads accept PDF MIME type only and are limited to 5 MiB. Files use
Multer memory storage and are streamed to Cloudinary as raw resources.
Avatar uploads accept JPEG, PNG, or WebP and are limited to 3 MiB. Replacements
upload the new asset before deleting the previous Cloudinary image.

### Recruiters: `/api/v1/recruiters`

| Method  | Path                | Access    | Input                  | Result                                                        |
| ------- | ------------------- | --------- | ---------------------- | ------------------------------------------------------------- |
| `GET`   | `/me`               | Recruiter | None                   | Current recruiter profile                                     |
| `PATCH` | `/me`               | Recruiter | `{ fullName, title? }` | Updated recruiter profile                                     |
| `POST`  | `/me/leave-company` | Recruiter | None                   | Clears membership; a sole owner also soft-deletes the company |

An owner cannot leave while other active recruiters remain. Ownership transfer
is not implemented yet, so the request returns `409
RECRUITER_OWNER_MUST_TRANSFER` in that state.

### Companies: `/api/v1/companies`

| Method  | Path        | Access                        | Input                  | Result                                                   |
| ------- | ----------- | ----------------------------- | ---------------------- | -------------------------------------------------------- |
| `POST`  | `/`         | Recruiter                     | Company create body    | Creates company and makes actor owner in one transaction |
| `GET`   | `/:id`      | Public                        | Company ID             | Active company                                           |
| `PATCH` | `/:id`      | Company owner/admin recruiter | Partial company body   | Updated company                                          |
| `POST`  | `/:id/logo` | Company owner/admin recruiter | Multipart field `logo` | Updated company with Cloudinary logo metadata            |

Company bodies support `name`, `description`, `industry`, `logoUrl`,
`websiteUrl`, and `size`. Valid sizes are `1-10`, `11-50`, `51-200`,
`201-1000`, and `1000+`. The public slug is generated at creation and is not
changed by the generic update endpoint.

Logo uploads accept JPEG, PNG, or WebP MIME types and are limited to 2 MiB.

### Jobs: `/api/v1/jobs`

| Method   | Path           | Access                       | Input                            | Result                                                |
| -------- | -------------- | ---------------------------- | -------------------------------- | ----------------------------------------------------- |
| `POST`   | `/`            | Recruiter with company       | Job create body                  | Creates a draft job                                   |
| `GET`    | `/`            | Public                       | Paginated filter query           | Published jobs, newest publication first              |
| `GET`    | `/mine`        | Recruiter                    | Pagination and optional `status` | Current company jobs in any status                    |
| `GET`    | `/:id`         | Public/optional auth         | Job ID                           | Published/closed job, or manageable draft             |
| `PATCH`  | `/:id`         | Recruiter accepted by policy | Partial job body                 | Updated job                                           |
| `PATCH`  | `/:id/publish` | Recruiter accepted by policy | None                             | Published job; first publication stamps `publishedAt` |
| `PATCH`  | `/:id/close`   | Recruiter accepted by policy | None                             | Closed job                                            |
| `DELETE` | `/:id`         | Recruiter accepted by policy | None                             | Soft-deletes job using `isDeleted`                    |

Job create/update fields are `title`, `description`, `employmentType`,
`experienceLevel`, `skillsRequired`, `location` (string array), `isRemote`, and
optional `salaryRange { min?, max?, currency? }`. Status changes are separate
actions and cannot be supplied to the generic create/update body.

Public list filters are `skill`, `location`, `employmentType`,
`experienceLevel`, `isRemote`, and `companyId`, plus pagination.

### Applications: `/api/v1/applications`

| Method  | Path          | Access                                | Input                            | Result                                                                                |
| ------- | ------------- | ------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| `POST`  | `/`           | Candidate                             | `{ jobId, coverLetter? }`        | Creates application, increments job count, and notifies job author in one transaction |
| `GET`   | `/me`         | Candidate                             | Pagination and optional `status` | Actor's applications                                                                  |
| `GET`   | `/job/:jobId` | Recruiter accepted by job policy      | Pagination and optional `status` | Applications for the job                                                              |
| `GET`   | `/:id`        | Owning candidate or company recruiter | Application ID                   | Application                                                                           |
| `PATCH` | `/:id/status` | Owning candidate or company recruiter | `{ status }`                     | Updated application and notification                                                  |

Application statuses are `applied`, `under_review`, `shortlisted`, `rejected`,
`hired`, and `withdrawn`.

Transition rules:

- Candidates may only set their own non-final application to `withdrawn`.
- Recruiters may not set `applied` or `withdrawn` directly.
- Recruiters cannot change a withdrawn application.
- Every saved status change appends `{ status, changedAt, changedBy }` to
  `statusHistory`.

Applying requires a current candidate resume and a published, non-deleted job.
The resume URL is copied into `resumeSnapshotUrl` at application time.

### Search: `/api/v1/search`

| Method | Path          | Access             | Query                                                                              | Result                               |
| ------ | ------------- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------ |
| `GET`  | `/jobs`       | Public             | Required `q`; optional `location`, `employmentType`, `experienceLevel`, pagination | Fuzzy Atlas Search job results       |
| `GET`  | `/candidates` | Recruiter or admin | Required `q`; optional `location`, `availability`, pagination                      | Fuzzy Atlas Search candidate results |

These routes require the `job_search` and `candidate_search` Atlas Search
indexes created by `pnpm --dir server search:setup`.

### Saved Candidates: `/api/v1/savedCandidate`

The singular/camel-case mount path reflects the current server and is part of
the current contract.

| Method   | Path   | Access           | Input                    | Result                          |
| -------- | ------ | ---------------- | ------------------------ | ------------------------------- |
| `POST`   | `/`    | Recruiter        | `{ candidateId, note? }` | Saved-candidate record          |
| `GET`    | `/me`  | Recruiter        | Pagination               | Actor's saved-candidate records |
| `PATCH`  | `/:id` | Owning recruiter | `{ note? }`              | Updated record                  |
| `DELETE` | `/:id` | Owning recruiter | None                     | Hard-deletes saved record       |

Notes have a maximum length of 1,000 characters. The pair
`(recruiterId, candidateId)` is unique.

### Notifications: `/api/v1/notification`

The singular mount path reflects the current server and is part of the current
contract.

| Method  | Path        | Access             | Input/query                      | Result                                   |
| ------- | ----------- | ------------------ | -------------------------------- | ---------------------------------------- |
| `GET`   | `/me`       | Authenticated      | Pagination and optional `isRead` | Notification page plus true unread count |
| `PATCH` | `/read-all` | Authenticated      | None                             | `{ modifiedCount }`                      |
| `PATCH` | `/:id/read` | Notification owner | Notification ID                  | Updated notification                     |

### Dashboards: `/api/v1/dashboard`

| Method | Path         | Access    | Result                                                                             |
| ------ | ------------ | --------- | ---------------------------------------------------------------------------------- |
| `GET`  | `/candidate` | Candidate | Profile completion, resume state, application counts/history, recent notifications |
| `GET`  | `/recruiter` | Recruiter | Company state, job/application counts, saved count, recent applications            |
| `GET`  | `/admin`     | Admin     | User/profile/company/job/application totals                                        |

### Administration: `/api/v1/admin`

All routes in this group require the `admin` role.

| Method   | Path                  | Input/query                                      | Result                                                  |
| -------- | --------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `GET`    | `/users`              | Pagination and optional `role`                   | Users, including currently soft-deleted/suspended users |
| `PATCH`  | `/users/:id/moderate` | `{ action: "suspend" or "reactivate", reason? }` | Updated user and activity log entry                     |
| `GET`    | `/companies`          | Pagination                                       | Active companies                                        |
| `DELETE` | `/companies/:id`      | Company ID                                       | Soft-deletes company and writes activity log            |
| `GET`    | `/jobs`               | Pagination and optional `status`                 | Non-deleted jobs                                        |
| `DELETE` | `/jobs/:id`           | Job ID                                           | Soft-deletes job and writes activity log                |

## Error Code Taxonomy

### Authentication and authorization

| Code                       | Meaning                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `AUTH_INVALID_CREDENTIALS` | Email/password or confirmation password did not match                                 |
| `AUTH_EMAIL_NOT_VERIFIED`  | Login is blocked pending verification                                                 |
| `AUTH_TOKEN_EXPIRED`       | Access or refresh token expired                                                       |
| `AUTH_TOKEN_INVALID`       | Token is malformed, tampered, revoked, or verification/reset token is invalid/expired |
| `AUTH_UNAUTHORIZED`        | Required authentication or refresh cookie is absent                                   |
| `AUTH_FORBIDDEN`           | Role, ownership, or company policy denied the action                                  |

### Users and profiles

| Code                            | Meaning                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `USER_404`                      | User not found                                            |
| `USER_ALREADY_EXISTS`           | Active account already uses the email                     |
| `CANDIDATE_404`                 | Candidate profile not found                               |
| `CANDIDATE_RESUME_REQUIRED`     | Applying requires an uploaded resume                      |
| `RECRUITER_404`                 | Recruiter profile not found                               |
| `RECRUITER_NO_COMPANY`          | Action requires company membership                        |
| `RECRUITER_ALREADY_IN_COMPANY`  | Recruiter attempted to create a second company membership |
| `RECRUITER_OWNER_MUST_TRANSFER` | Owner cannot leave while other active recruiters remain   |

### Companies and jobs

| Code                 | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| `COMPANY_404`        | Active company not found                                |
| `COMPANY_SLUG_TAKEN` | Generated company slug conflicts with an active company |
| `JOB_404`            | Visible, non-deleted job not found                      |
| `JOB_NOT_PUBLISHED`  | Application target is not currently published           |

### Applications and saved candidates

| Code                            | Meaning                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `APPLICATION_404`               | Application not found                                         |
| `APPLICATION_DUPLICATE`         | Candidate already applied to the job                          |
| `APPLICATION_ALREADY_FINALIZED` | Requested transition is invalid after withdrawal/finalization |
| `CANDIDATE_ALREADY_SAVED`       | Recruiter already saved the candidate                         |
| `SAVED_CANDIDATE_404`           | Saved-candidate record not found                              |

### Notifications, validation, uploads, and generic errors

| Code                  | Meaning                                                         |
| --------------------- | --------------------------------------------------------------- |
| `NOTIFICATION_404`    | Notification is absent or belongs to another user               |
| `VALIDATION_ERROR`    | Zod or Mongoose validation failed, or required upload is absent |
| `INVALID_FILE_TYPE`   | Uploaded file MIME type is not accepted                         |
| `INVALID_FILE_UPLOAD` | Multer rejected the upload, including file-size failures        |
| `DUPLICATE_ENTRY`     | MongoDB unique-index conflict without a domain-specific mapping |
| `RATE_LIMITED`        | Global or auth-specific rate limit exceeded                     |
| `ROUTE_NOT_FOUND`     | No Express route matched the method/path                        |
| `INTERNAL_ERROR`      | Unexpected failure; production hides the internal message       |

Before adding a code, reuse an existing code when its semantics match. Add any
new code to this taxonomy in the same change as the implementation.

## Current Contract Caveats

The following are implementation gaps, not intended API semantics:

- ID parameters are not yet validated as MongoDB ObjectIds, so malformed IDs
  can reach Mongoose and become `500 INTERNAL_ERROR`.
- `z.coerce.boolean()` currently interprets any non-empty query string as
  `true`; this affects `isRemote=false` and `isRead=false`.
- Atlas Search result pipelines filter deleted/unpublished records after
  `$search`, while `$searchMeta` counts before those filters.
- Company deletion does not cascade to jobs or recruiter memberships.

See [Project Status](./PROJECT_STATUS.md) for ownership and remediation order.
