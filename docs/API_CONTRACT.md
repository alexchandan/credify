# API Contract

Every endpoint in this API — no exceptions — returns one of the two shapes below. Controllers must use `sendSuccess()` / `sendError()` (see `src/utils/apiResponse.ts`) and never call `res.json()` directly.

## Success Response

```json
{
  "success": true,
  "data": { "...": "..." },
  "message": "Job fetched",
  "meta": { "page": 1, "totalPages": 5, "totalCount": 47 }
}
```

- `data` — the payload. `null` if there's nothing meaningful to return (e.g. a delete).
- `message` — short, human-readable, safe to show in a toast/notification.
- `meta` — optional. Used for pagination info, counts, etc. Omitted when not relevant.

## Error Response

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

- `code` — a stable, machine-readable identifier (see taxonomy below). Frontend code should branch on `code`, never on `message` (messages can change wording without breaking the frontend).
- `message` — human-readable, safe to display directly.
- `details` — array, populated for validation errors (e.g. field-level messages). Empty otherwise.

## HTTP Status Code Usage

| Status | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET/PATCH/DELETE |
| 201 | Created | Successful POST that creates a resource |
| 400 | Bad Request | Validation failure, malformed input |
| 401 | Unauthorized | Missing/invalid/expired access token |
| 403 | Forbidden | Valid auth, but not permitted to perform this action |
| 404 | Not Found | Resource doesn't exist (or is soft-deleted) |
| 409 | Conflict | Duplicate entry (e.g. unique index violation) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected/unhandled error |

## Error Code Taxonomy

Codes follow the pattern `DOMAIN_REASON`. Add new codes here as new modules are built — this list must stay in sync with the codebase.

### AUTH
| Code | Meaning |
|---|---|
| `AUTH_INVALID_CREDENTIALS` | Wrong email or password |
| `AUTH_EMAIL_NOT_VERIFIED` | Login blocked pending email verification |
| `AUTH_TOKEN_EXPIRED` | Access or refresh token expired |
| `AUTH_TOKEN_INVALID` | Token malformed, tampered, or token version mismatch |
| `AUTH_UNAUTHORIZED` | No valid token provided |
| `AUTH_FORBIDDEN` | Authenticated, but role/permission doesn't allow this action |

### VALIDATION
| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Generic Zod/Mongoose validation failure — see `details` array |

### USER
| Code | Meaning |
|---|---|
| `USER_404` | User not found |
| `USER_ALREADY_EXISTS` | Email already registered |

### CANDIDATE
| Code | Meaning |
|---|---|
| `CANDIDATE_404` | Candidate profile not found |

### RECRUITER / COMPANY
| Code | Meaning |
|---|---|
| `RECRUITER_404` | Recruiter profile not found |
| `RECRUITER_NO_COMPANY` | Action requires the recruiter to belong to a company |
| `COMPANY_404` | Company not found |
| `COMPANY_SLUG_TAKEN` | Company slug already in use |

### JOB
| Code | Meaning |
|---|---|
| `JOB_404` | Job not found |
| `JOB_NOT_PUBLISHED` | Attempted to apply to a draft/closed job |

### APPLICATION
| Code | Meaning |
|---|---|
| `APPLICATION_404` | Application not found |
| `APPLICATION_DUPLICATE` | Candidate already applied to this job |

### GENERIC
| Code | Meaning |
|---|---|
| `DUPLICATE_ENTRY` | Unique index violation not covered by a more specific code |
| `RATE_LIMITED` | Too many requests |
| `ROUTE_NOT_FOUND` | No matching route |
| `INTERNAL_ERROR` | Unexpected/unhandled error |

## Rule for Adding New Codes

Before introducing a new error code, check this table first. Reuse an existing code if the situation matches — the taxonomy loses value if every endpoint invents its own one-off code.
