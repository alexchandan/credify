<!-- use markdown preview extension or tools for better experience-->

# Environment Setup

## Prerequisites

- Node.js 20+
- pnpm 9+ (the project uses a pnpm workspace, not npm — `npm install` at the root will not work correctly)
- A MongoDB Atlas account (free M0 tier is fine for development)
- Git

## 1. Cloggne and install

```bash
git clone <repo-url> credify
cd credify
pnpm install   # installs client, server, and any shared workspace packages together
```

To work on a single package specifically:

```bash
pnpm --filter server add <package>
pnpm --filter server remove <package>
```

## 2. Set up MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Create **two databases** on it (or two separate clusters if you prefer full isolation): `credify_dev` and `credify_prod`. Never develop against the same database you intend to launch with.
3. Under Database Access, create a user with read/write permissions.
4. Under Network Access, allow your current IP (or `0.0.0.0/0` for local development only — never in production).
5. Copy the connection string — you'll need it for `MONGODB_URI` below.

## 3. Configure environment variables

### Server

```bash
cd server
cp .env.example .env
```

Fill in:

```
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/credify_dev
JWT_ACCESS_SECRET=<generate a long random string>
JWT_REFRESH_SECRET=<generate a different long random string>
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice — access and refresh secrets must be different values.

### Client

```bash
cd client
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

## 4. Run the project

Server:

```bash
cd server
pnpm dev
```

Visit `http://localhost:5000/health` — should return `{ "success": true, "data": { "status": "ok", ... } }`.

Client:

```bash
cd client
pnpm dev
```

Visit `http://localhost:3000`.

## 5. Verify the database connection

If the server logs `Connected to MongoDB` on startup and `/health` responds, the connection is working. If it hangs or errors:

- Double-check the Network Access IP allowlist in Atlas.
- Confirm the password in `MONGODB_URI` doesn't contain unescaped special characters (URL-encode them if it does).

## 6. Seed test data (optional, recommended for local development)

```bash
cd server
pnpm seed          # adds to existing data
pnpm seed -- --fresh   # wipes seed-relevant collections first
```

Generates ~30 companies, ~60–90 recruiters, 200 candidates, 150 jobs, 500 applications. All seeded users share the password printed at the end of the run.

## Common Issues

| Symptom                                                                                                   | Likely cause                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server exits immediately with "Missing required environment variable"                                     | One of `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` is missing from `.env`                                                                                                                                                      |
| CORS error in browser console                                                                             | `CLIENT_ORIGIN` in server `.env` doesn't match the client's actual URL/port                                                                                                                                                                 |
| Mongo connection times out                                                                                | IP not allowlisted in Atlas Network Access                                                                                                                                                                                                  |
| `TypeError: Cannot set property query of #<IncomingMessage> which has only a getter` on any/every request | A dependency (previously `express-mongo-sanitize`) is trying to reassign `req.query` directly, which Express 5 blocks. See DECISIONS.md ADR-016 — the project now uses a custom `mongoSanitize()` middleware that mutates in place instead. |
| `tsc` passes but the server crashes at runtime                                                            | A clean type-check does not guarantee correct runtime behavior — always boot the server and hit it with a real request after any dependency change. See CODING_STANDARDS.md's Verification Rule.                                            |
