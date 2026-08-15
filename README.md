# Credify

Credify is a full-stack recruitment and talent-management platform under active
development. It brings candidate profiles, recruiter workflows, companies,
jobs, applications, search, saved candidates, notifications, dashboards, and
administration into one product.

The backend already implements most of the core recruitment API. The frontend
currently covers the public landing page, authentication flows, public job
browsing and details, candidate application submission, candidate profile
management, and a role-protected candidate dashboard. Recruiter,
administrator, and application-history interfaces are still being built. AI
report storage has been designed, but no AI provider or user-facing AI workflow
is connected yet.

## Current Implementation

| Area               | Status                                          | What exists today                                                                                                                                                                              |
| ------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API foundation     | Implemented                                     | Versioned REST API, consistent response contract, request IDs, structured logging, CORS, Helmet, rate limiting, input sanitization, and centralized error handling                             |
| Authentication     | Implemented                                     | Candidate/recruiter registration, email verification, login, access/refresh tokens, token refresh, logout, logout everywhere, password reset/change, session restoration, and account deletion |
| Candidate profiles | Implemented                                     | Responsive profile editor, avatar and resume upload/removal, education, experience, projects, certifications, skills, links, availability, and recruiter/admin lookup                          |
| Recruiter profiles | Backend and frontend implemented                | Responsive identity/basic profile editor, company membership management, and leave-company workflow                                                                                            |
| Companies          | Backend implemented                             | Create, read, update, logo upload, ownership assignment, and authorization policies                                                                                                            |
| Jobs               | Backend and public frontend                     | Public search/filtering and job details in the client; draft creation, update, publish, close, soft delete, and company listings in the API                                                    |
| Applications       | Backend and candidate submission frontend       | Candidates can apply from job details; history, recruiter review, withdrawal, and status management remain API-only                                                                            |
| Search             | Backend implemented, Atlas verification pending | Fuzzy Atlas Search for jobs and candidates plus one-time index setup script                                                                                                                    |
| Saved candidates   | Backend implemented                             | Recruiter-specific saved lists and notes                                                                                                                                                       |
| Notifications      | Backend and candidate dashboard                 | Paginated notification feed, unread counts, and mark-one/all APIs; the candidate dashboard shows recent updates and supports marking all read                                                  |
| Dashboards         | Candidate/recruiter frontend and backend        | Responsive candidate and recruiter overviews with application pipeline, company/job stats, notifications, and recent work; administrator summary remains API-only                              |
| Administration     | Backend implemented                             | User moderation, company/job listings, company/job deletion, and partial activity logging                                                                                                      |
| Frontend           | In progress                                     | Responsive light/dark interface, landing/header, authentication, public job board/details, candidate application submission, profile, and dashboard                                            |
| AI features        | Schema only                                     | `AIReport` model and lifecycle; no queue, provider, service, route, or UI yet                                                                                                                  |
| Automated tests    | Minimal                                         | Query middleware, candidate profile payloads, and dashboard aggregation helpers have focused regression tests; broader integration and end-to-end coverage is still needed                     |

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
│       ├── components/         # Navigation, auth, job, footer, and landing UI
│       ├── context/            # Authentication state
│       ├── lib/                # API client and form-error helpers
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

The client root layout owns shared authentication state. Route-group layouts
then choose their chrome: `(public)` and `(candidate)` render the site header
and footer through `SiteChrome`, while every page in `(auth)` uses a focused
header-free and footer-free account layout. The `(candidate)` layout also
enforces the candidate role before rendering protected pages.

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

| Prefix            | Access                                            | Main capabilities                                                                                            |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/auth`           | Public and authenticated                          | Registration, login, refresh, verification, password recovery/change, logout, current user, account deletion |
| `/candidates`     | Candidate, recruiter, or admin depending on route | Own-profile management, avatar/resume upload and removal, candidate detail lookup                            |
| `/recruiters`     | Recruiter                                         | Own-profile management and leaving a company                                                                 |
| `/companies`      | Public reads; recruiter writes                    | Company creation, details, updates, and logo upload                                                          |
| `/jobs`           | Public reads; recruiter writes                    | Job feed, filters, details, company jobs, lifecycle management                                               |
| `/applications`   | Candidate or recruiter                            | Apply, list, inspect, withdraw, and update application status                                                |
| `/search`         | Public jobs; recruiter/admin candidates           | Atlas Search-backed fuzzy search                                                                             |
| `/savedCandidate` | Recruiter                                         | Personal candidate shortlist and notes                                                                       |
| `/notification`   | Authenticated                                     | Notification feed and read state                                                                             |
| `/dashboard`      | Authenticated and role-scoped                     | Candidate, recruiter, and admin summaries                                                                    |
| `/admin`          | Admin                                             | User moderation and company/job management                                                                   |

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

| Route                  | Purpose                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `/`                    | Public landing page with job and skill previews                                           |
| `/login`               | Email/password login                                                                      |
| `/register`            | Candidate or recruiter registration                                                       |
| `/check-email`         | Verification-email confirmation and resend action                                         |
| `/verify-email`        | Email verification link handler                                                           |
| `/forgot-password`     | Password-reset request                                                                    |
| `/reset-password`      | Password-reset link handler                                                               |
| `/unauthorized`        | Access-denied state                                                                       |
| `/jobs`                | Public job search, filters, and pagination                                                |
| `/jobs/:id`            | Public job details and candidate application submission                                   |
| `/candidate/dashboard` | Candidate search overview, profile readiness, applications, resume, updates, and new jobs |
| `/candidate/profile`   | Candidate profile, resume, password, and account settings                                 |
| `/recruiter/dashboard` | Recruiter company/job/application overview and recent jobs                                |
| `/recruiter/profile`   | Recruiter identity, company management, logo upload, password, and account settings       |

Recruiter management, candidate application history, full notification feeds,
recruiter/admin dashboards, and administrator pages do not have frontend
implementations yet.

## Prerequisites

- Node.js 22.13 or newer
- pnpm 11.9
- A MongoDB Atlas deployment (transactions require a replica set)
- Cloudinary credentials for avatar, resume, and company-logo uploads
- A Resend API key and verified sender for email flows

Atlas Search is required only for the `/search` endpoints. The rest of the API
uses normal MongoDB queries and indexes.

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

| Command             | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Start client and server development processes |
| `pnpm build`        | Build the Next.js client and compiled API     |
| `pnpm test`         | Run the server test suite                     |
| `pnpm type-check`   | Type-check both workspaces                    |
| `pnpm lint`         | Lint both workspaces                          |
| `pnpm lint:fix`     | Apply ESLint fixes                            |
| `pnpm format`       | Format the repository with Prettier           |
| `pnpm format:check` | Check formatting without modifying files      |
| `pnpm verify`       | Run the complete local release gate           |

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

- Most backend modules do not yet have corresponding frontend screens.
- Company deletion does not cascade or close the company's published jobs.
- Job permission rules need reconciliation with the documented member role.
- Candidate Atlas Search still needs production-like validation and filtered
  count review; the public job-search filter pipeline has been live-checked.
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
- Husky runs lint-staged and workspace type-checking before commits.
- The pre-push hook validates branch names, linting, type-checking, tests, and
  production builds.
- Supported branch patterns include `main`, `dev-V1`, and prefixes such as
  `feature/`, `fix/`, `hotfix/`, `docs/`, `experiment/`, and `improve/`.
- Keep environment files local. `.env`, `.env.local`, and build output are
  ignored by Git.
