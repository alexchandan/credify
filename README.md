# Credify

Credify is a full-stack recruitment and talent-management platform under active
development. It brings candidate profiles, recruiter workflows, companies,
jobs, applications, search, saved candidates, notifications, dashboards, and
administration into one product.

**Documentation snapshot:** 2026-10-03 · **Workspace version:** 1.6.1

The core recruitment API and candidate/recruiter workspaces are implemented.
Candidates can maintain profiles, browse jobs, apply, track applications, and
withdraw. Recruiters can manage companies and jobs, review applications,
search candidates, and maintain private shortlists. Signed-in users see a
personalized home overview. Administration has API support and a home summary,
but dedicated moderation screens are still pending. AI reports remain schema-only.

## Current Implementation

| Area                             | Status                                         | What exists today                                                                                                                                 |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| API foundation                   | Implemented                                    | 60 domain endpoints, versioned REST responses, request IDs, structured logging, CORS, Helmet, rate limiting, sanitization, and centralized errors |
| Authentication                   | Implemented                                    | Registration, verification, sign-in, access/refresh tokens, password flows, logout, seven-day account recovery, and scheduled permanent cleanup   |
| Candidate profiles               | Backend and frontend                           | Profile editing, avatar/resume upload and removal, education, experience, projects, certifications, skills, links, and availability               |
| Recruiter profiles and companies | Backend and frontend                           | Recruiter identity, company creation/editing, logo upload, leave-company workflow, and public company pages                                       |
| Jobs                             | Backend and frontend                           | Public list/grid browsing, filters, pagination, details, and recruiter draft/create/edit/publish/close/delete workflows                           |
| Applications                     | Backend and frontend                           | Submission, candidate history and withdrawal, recruiter review pipeline, resume/cover-letter inspection, and status changes                       |
| Search                           | Backend and frontend; Atlas validation pending | Recruiter candidate discovery with filters, pagination, list/grid views, profile drawer, and MongoDB fallback; separate fuzzy job-search API      |
| Saved candidates                 | Backend and frontend                           | Recruiter private shortlist, notes, note editing, and removal                                                                                     |
| Notifications                    | Backend and shared header                      | Paginated dropdown, unread counts, mark-all-read, and SSE application events; no dedicated full-feed page                                         |
| Dashboards                       | Candidate/recruiter UI and backend             | Role-specific workspace dashboards and personalized home summaries; dedicated admin workspace pending                                             |
| Interface                        | Implemented; regression coverage pending       | Responsive light/dark UI, role-aware navigation, route skeletons, progress bar, and cookie-backed identity rendering                              |
| Administration                   | API and home summary                           | Moderation and company/job deletion APIs; no dedicated management screens                                                                         |
| AI features                      | Schema only                                    | `AIReport` lifecycle; no provider, queue, service, route, or UI                                                                                   |
| Automated tests                  | Focused                                        | Seven tests across query middleware, candidate payload validation, and dashboard helpers; integration and end-to-end coverage pending             |

## Technology Stack

### Client

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide and React Icons
- Native Fetch API through a shared API client
- In-memory access tokens with an HTTP-only refresh-token cookie

### Server

- Node.js and Express 5
- TypeScript with strict compiler settings
- MongoDB Atlas and Mongoose 9
- Zod request validation
- JSON Web Tokens and bcrypt
- Cloudinary and Multer for uploads
- Resend for transactional email
- Atlas Search for fuzzy job and candidate search
- Pino and `pino-http` for structured logging

### Tooling

- pnpm workspaces
- ESLint and Prettier
- Husky and lint-staged
- Conventional Commit and branch-name checks

## Repository Structure

```text
Credify/
├── client/                     # Next.js application
│   ├── public/                 # Static assets
│   └── src/
│       ├── app/                # App Router pages and layouts
│       ├── components/         # Navigation, auth, jobs, candidates, and landing UI
│       ├── context/            # Authentication state
│       ├── lib/                # API client, auth snapshots, route helpers, and formatting
│       └── types/              # Client-side domain types
├── server/                     # Express REST API
│   └── src/
│       ├── config/             # Environment and Cloudinary configuration
│       ├── middlewares/        # Auth, validation, security, uploads, and errors
│       ├── models/             # Mongoose domain models
│       ├── modules/            # Route/controller/service/validation modules
│       ├── policies/           # Resource-level authorization rules
│       ├── scripts/            # Seed and Atlas Search setup scripts
│       ├── types/              # Express type augmentation
│       └── utils/              # Tokens, email, storage, logging, and responses
├── docs/                       # Architecture and engineering documentation
├── package.json                # Workspace scripts and git-hook configuration
└── pnpm-workspace.yaml         # client + server workspace definition
```

There is no shared workspace package at present. Client and server types and
validation schemas are maintained separately.

The root layout reads the `credify-auth-user` identity snapshot and initializes
shared authentication state. Public, candidate, and recruiter route groups use
`SiteChrome`; authentication pages use a focused account layout. Candidate and
recruiter layouts enforce roles, and `client/src/proxy.ts` redirects protected
and guest-only routes before rendering. The snapshot is an unsigned display and
routing hint; the API authenticates requests using the access JWT. Access tokens
remain in memory and are restored through the HTTP-only refresh cookie.

## Data Model

The server currently defines ten MongoDB models:

- `User`
- `CandidateProfile`
- `RecruiterProfile`
- `Company`
- `Job`
- `Application`
- `SavedCandidate`
- `Notification`
- `ActivityLog`
- `AIReport`

Identity is separated from role-specific profile data. Applications retain a
resume snapshot and status history, jobs maintain a denormalized application
counter, and multi-document registration/company/application workflows use
MongoDB transactions.

See [Database Schema](./docs/DATABASE_SCHEMA.md) and
[Architecture Decisions](./docs/DECISIONS.md) for the detailed design.

## API Overview

The API base path is `/api/v1`. Health information is available separately at
`GET /health`.

| Prefix            | Access                                            | Main capabilities                                                                                                     |
| ----------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/auth`           | Public and authenticated                          | Registration, login, refresh, verification, password recovery/change, logout, current user, account deletion/recovery |
| `/candidates`     | Candidate, recruiter, or admin depending on route | Own-profile management, avatar/resume upload and removal, candidate detail lookup                                     |
| `/recruiters`     | Recruiter                                         | Own-profile management and leaving a company                                                                          |
| `/companies`      | Public reads; recruiter writes                    | Company creation, details, updates, and logo upload                                                                   |
| `/jobs`           | Public reads; recruiter writes                    | Job feed, filters, details, company jobs, lifecycle management                                                        |
| `/applications`   | Candidate or recruiter                            | Apply, list, inspect, withdraw, and update application status                                                         |
| `/search`         | Public jobs; recruiter/admin candidates           | Atlas Search-backed fuzzy search                                                                                      |
| `/savedCandidate` | Recruiter                                         | Personal candidate shortlist and notes                                                                                |
| `/notification`   | Authenticated                                     | Notification feed, read state, and SSE events                                                                         |
| `/dashboard`      | Authenticated and role-scoped                     | Candidate, recruiter, and admin summaries                                                                             |
| `/admin`          | Admin                                             | User moderation and company/job management                                                                            |

Every successful endpoint follows this shape:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed",
  "meta": {}
}
```

Every failed endpoint follows this shape:

```json
{
  "success": false,
  "error": {
    "code": "DOMAIN_REASON",
    "message": "Safe user-facing message",
    "details": []
  }
}
```

See [API Contract](./docs/API_CONTRACT.md) for response conventions and the
complete current route and error-code reference.

## Frontend Routes

The following pages currently exist:

| Route                              | Purpose                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| `/`                                | Public landing or personalized candidate/recruiter/admin overview  |
| `/login`                           | Sign-in and recovery of a deleted account within seven days        |
| `/register`                        | Candidate or recruiter registration                                |
| `/check-email`                     | Verification-email confirmation and resend                         |
| `/verify-email`                    | Email verification link handler                                    |
| `/forgot-password`                 | Password-reset request                                             |
| `/reset-password`                  | Password-reset link handler, including eligible account recovery   |
| `/unauthorized`                    | Access-denied state                                                |
| `/jobs`                            | Public job search, filters, pagination, and list/grid views        |
| `/jobs/:id`                        | Public job details and candidate application submission            |
| `/companies/:id`                   | Public company profile and published jobs                          |
| `/candidate/dashboard`             | Profile readiness, application summary, resume, updates, and jobs  |
| `/candidate/profile`               | Profile, uploads, password, and account settings                   |
| `/candidate/applications`          | Application history, status filters, and withdrawal                |
| `/recruiter/dashboard`             | Company, jobs, application pipeline, and recent work               |
| `/recruiter/profile`               | Recruiter identity, company management, logo, and account settings |
| `/recruiter/jobs`                  | Company jobs with publish, close, edit, and delete actions         |
| `/recruiter/jobs/new`              | Create a draft or create and publish a job                         |
| `/recruiter/jobs/:id/edit`         | Edit a job                                                         |
| `/recruiter/jobs/:id/applications` | Review applicants and update their status                          |
| `/recruiter/candidates`            | Candidate discovery, profile inspection, and saving                |
| `/recruiter/saved-candidates`      | Private shortlist and note management                              |

Application history, recruiter jobs, application pipelines, saved candidates,
and public company job lists currently load at most 50 records without a
next-page control. Dedicated admin management and full notification-feed pages
remain pending.

## Prerequisites

- Node.js 22.13 or newer
- pnpm 11.9
- A MongoDB Atlas deployment (transactions require a replica set)
- Cloudinary credentials for avatar, resume, and company-logo uploads
- A Resend API key and verified sender for email flows

Atlas Search is required for fuzzy `/search/jobs` queries. Candidate discovery
uses normal MongoDB queries when `q` is absent or Atlas search throws; the public
job board uses `/jobs`, which also uses normal MongoDB queries.

## Local Setup

1. Install all workspace dependencies from the repository root:

   ```bash
   pnpm install
   ```

2. Create the server environment file:

   ```bash
   cp server/.env.example server/.env.local
   ```

3. Fill in `server/.env.local`:

   ```dotenv
   NODE_ENV=development
   PORT=5000
   CLIENT_ORIGIN=http://localhost:3000

   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/credify_dev

   JWT_ACCESS_SECRET=<long-random-secret>
   JWT_REFRESH_SECRET=<different-long-random-secret>

   CLOUDINARY_CLOUD_NAME=<cloud-name>
   CLOUDINARY_API_KEY=<api-key>
   CLOUDINARY_API_SECRET=<api-secret>

   RESEND_API_KEY=<resend-api-key>
   EMAIL_FROM="Credify <onboarding@your-domain.example>"
   ```

4. Create `client/.env.local` from the tracked template:

   ```bash
   cp client/.env.example client/.env.local
   ```

   ```dotenv
   NEXT_PUBLIC_API_BASE_URL=/api/v1
   API_PROXY_TARGET=http://localhost:5000/api/v1
   ```

5. Start both workspaces:

   ```bash
   pnpm dev
   ```

   The client runs at `http://localhost:3000`. The server defaults to
   `http://localhost:5000`, and its health endpoint is
   `http://localhost:5000/health`.

You can also run the packages independently:

```bash
pnpm --dir client dev
pnpm --dir server dev
```

## Database Utilities

### Seed development data

```bash
pnpm --dir server seed
```

To remove seed-relevant records before inserting a new dataset:

```bash
pnpm --dir server seed -- --fresh
```

`--fresh` deletes data from the seed-relevant collections. The script refuses
to run when `NODE_ENV=production` or when the MongoDB URI contains
`credify_prod`.

The current seed script creates companies, recruiters, candidates, jobs,
applications, and saved candidates. Candidate users are currently inserted via
`insertMany()`, which bypasses the password `save` hook; fix this before relying
on seeded candidate login credentials.

### Create Atlas Search indexes

```bash
pnpm --dir server search:setup
```

This creates the `candidate_search` and `job_search` indexes. It must run
against MongoDB Atlas, and newly created indexes may take several minutes to
become ready.

## Workspace Commands

Run these from the repository root:

| Command                  | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `pnpm dev`               | Start client and server development processes         |
| `pnpm build`             | Build the Next.js client and compiled API             |
| `pnpm test`              | Run the server test suite                             |
| `pnpm type-check`        | Type-check both workspaces                            |
| `pnpm lint`              | Lint both workspaces                                  |
| `pnpm lint:fix`          | Apply ESLint fixes                                    |
| `pnpm format`            | Format the repository with Prettier                   |
| `pnpm format:check`      | Check formatting without modifying files              |
| `pnpm verify`            | Run the complete local release gate                   |
| `pnpm version:check`     | Validate package versions                             |
| `pnpm version:increment` | Increment all three package versions (default: patch) |

Pass `major`, `minor`, or `patch` to `pnpm version:increment` to choose the bump.

The server build emits `server/dist/server.js`; start it with
`pnpm --dir server start`. See [Deployment](./docs/DEPLOYMENT.md) for the
production topology, environment matrix, and release checklist.

## Security and Reliability Foundations

Implemented safeguards include:

- Short-lived access tokens and HTTP-only refresh-token cookies
- Refresh-token rotation and global refresh-token invalidation through
  `tokenVersion`
- Password hashing with bcrypt
- Hashed email-verification and password-reset tokens
- Role gates plus resource-level authorization policies
- Auth-specific and global rate limits
- Helmet security headers and configured CORS origins
- Recursive stripping of MongoDB operator/dotted input keys
- Zod request validation and centralized API errors
- Request IDs and structured logs
- MIME and size restrictions for avatar/resume/logo uploads
- MongoDB transactions for multi-document invariants
- Soft deletion for core user-facing entities

Refresh tokens are rotated but are not currently single-use; reuse detection is
planned for a future persisted token store. Existing access tokens are also not
checked against `tokenVersion` on every request, so suspension and global
logout fully take effect for refresh only after the short-lived access token
expires.

## Known Gaps

- Dedicated admin management and full notification-feed screens remain pending.
- Several management/history screens stop at the first 50 records.
- SSE delivery is process-local and its connection/token lifecycle needs coverage.
- Account recovery and scheduled purge share the admin-suspension deletion field;
  moderation and cleanup semantics need separation.
- Company deletion does not cascade or close the company's published jobs.
- Job permission rules need reconciliation with the documented member role.
- Candidate Atlas Search still needs production-like validation and filtered
  count review; job search counts now use a filtered pipeline.
- Activity logging covers selected admin moderation/deletion actions, not every
  action represented by the activity model.
- Automated coverage remains focused on middleware, candidate profile payloads,
  and dashboard aggregation helpers; no CI workflow or provider-specific
  deployment manifest exists yet.
- AI reports are data-model-only; provider integration, background queues, and
  AI UI flows remain roadmap work.

## Documentation

- [Project Status and Known Risks](./docs/PROJECT_STATUS.md)
- [API Contract](./docs/API_CONTRACT.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Architecture Decisions](./docs/DECISIONS.md)
- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Coding Standards](./docs/CODING_STANDARDS.md)

The coding standards define strict TypeScript rules, API conventions, soft
deletion expectations, and the feature Definition of Done. At present, the
repository does not yet satisfy the documented integration-test requirement.

## Development Workflow

- Use Conventional Commits such as `feat(jobs): add saved filters` or
  `fix(jobs): enforce member ownership`.
- Husky checks the version, runs lint-staged, and type-checks before commits.
- Commit hooks synchronize package versions: `feat` bumps minor,
  `fix`/`perf`/`revert` bump patch, and breaking changes bump major. Other commit
  types do not automatically bump the version. `[skip version]` or `[no bump]`
  in the message, or `SKIP_AUTO_VERSION=1`, disables automatic versioning.
- The pre-push hook validates branch names, linting, type-checking, tests, and
  production builds.
- Supported branch patterns include `main`, `development`, `codex`,
  `dev-V<number>`, and prefixes such as
  `feature/`, `refactor/`, `fix/`, `hotfix/`, `docs/`, `experiment/`, and `improve/`.
- Keep environment files local. `.env`, `.env.local`, and build output are
  ignored by Git.
