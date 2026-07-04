# Credify

A full-stack AI-powered recruitment and talent management platform. Frontend and backend are fully separated, communicating over a versioned REST API.

## Tech Stack

**Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Redux Toolkit, Axios, React Hook Form, Zod, Framer Motion

**Backend:** Node.js, Express.js, TypeScript, MongoDB (Mongoose), JWT auth (access + refresh), Multer, Cloudinary

**Future integrations:** Gemini API, Socket.io, Redis (BullMQ), Docker, CI/CD

## Repository Structure

```
credify/
├── packages/shared/     # Shared Zod schemas, types, constants (frontend + backend both import from here)
├── backend/              # Express API
├── frontend/             # Next.js app
└── docs/                 # Project documentation (see below)
```

## Documentation Index

| Doc | What it covers |
|---|---|
| [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Every MongoDB collection: fields, relationships, indexes, and why each embed/reference decision was made |
| [docs/API_CONTRACT.md](./docs/API_CONTRACT.md) | The exact success/error response shape every endpoint must follow, plus the error code taxonomy |
| [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) | How to get the project running locally, from zero |
| [docs/CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) | Lint/format/commit rules and the Definition of Done for any feature |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architecture Decision Records — the *why* behind non-obvious choices, so they're not re-litigated later |

## Getting Started

See [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) for full setup steps.

Quick start (backend only, once `.env` is configured):

```bash
cd backend
npm install
npm run dev
```

## Current Status

**Phase 0 (Foundation):** Complete — error handling, logging, response contract, and security middleware are in place.

**Phase 1 (Data Modeling):** In progress — `User`, `CandidateProfile`, `RecruiterProfile`, and `Company` models are designed. `Job`, `Application`, `SavedCandidate`, and `Notification` are next.

See [docs/DECISIONS.md](./docs/DECISIONS.md) for the reasoning behind the schema so far.
