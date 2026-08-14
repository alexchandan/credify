# Environment Setup

This guide configures the Next.js client and Express API for local development.
Use [Deployment](./DEPLOYMENT.md) for production configuration.

## Prerequisites

- Node.js 22.13 or newer
- pnpm 11.9
- Git
- A MongoDB Atlas cluster or another MongoDB deployment that supports
  transactions
- Cloudinary credentials for resume and company-logo uploads
- A Resend API key and verified sender for application email

MongoDB's standalone local mode does not support the transactions used by the
application workflow. Use an Atlas cluster or a local replica set.

## 1. Install the Workspace

```bash
git clone <repository-url> credify
cd credify
pnpm install
```

Run package-specific dependency commands through the workspace, for example:

```bash
pnpm --filter server add <package>
pnpm --filter client remove <package>
```

## 2. Configure MongoDB

For Atlas development:

1. Create a cluster and a database user with read/write access.
2. Add your current IP address to the Atlas network access list.
3. Create separate development and production databases.
4. Copy the connection string and include a database name such as
   `credify_dev`.

URL-encode special characters in the database username or password.

## 3. Configure the Server

Create the local environment file from the tracked template:

```bash
cp server/.env.example server/.env.local
```

The server loads `.env.local` before `.env`. Configure these values:

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
EMAIL_FROM="Credify <noreply@example.com>"
```

`CLIENT_ORIGIN` accepts a comma-separated allowlist when more than one client
origin is needed. Generate JWT secrets separately:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

The startup validator requires every value shown above. In production it also
requires an explicit `CLIENT_ORIGIN`, validates origins and port ranges, and
requires both JWT secrets to contain at least 32 characters.

## 4. Configure the Client

Create the client environment file from the tracked template:

```bash
cp client/.env.example client/.env.local
```

```dotenv
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=http://localhost:5000/api/v1
```

The browser uses the relative `/api/v1` path and Next.js proxies it to the
absolute `API_PROXY_TARGET`. This keeps the refresh cookie same-origin and is
the recommended production topology. Keep the `/api/v1` suffix on both values.

## 5. Start Development

Start both workspace applications from the repository root:

```bash
pnpm dev
```

Or start them independently:

```bash
pnpm --dir server dev
pnpm --dir client dev
```

The defaults are:

- Client: `http://localhost:3000`
- API base: `http://localhost:5000/api/v1`
- Health check: `http://localhost:5000/health`

Verify the API in another terminal:

```bash
curl http://localhost:5000/health
```

A healthy response uses the standard success envelope and reports `status: ok`.
The `/api/v1` route also exposes basic API metadata.

## 6. Configure Atlas Search

Candidate and job search use MongoDB Atlas Search rather than ordinary text
indexes. With the server environment configured, create/update the expected
search indexes:

```bash
pnpm --dir server search:setup
```

The script targets the index names used by the search services. Index
provisioning can take time; search routes may fail until Atlas reports the
indexes as ready.

## 7. Verify External Services

- Register a user and confirm the verification email is accepted by Resend.
- Upload a JPEG, PNG, or WebP avatar smaller than 3 MB as a candidate.
- Upload a PDF resume smaller than 5 MB as a candidate.
- Upload a PNG, JPEG, or WebP logo smaller than 2 MB as a recruiter.
- Confirm replacement/deletion behavior in both MongoDB and Cloudinary before
  relying on it in production.

Use a Resend sender/domain that is valid for the target recipients. The default
Resend onboarding sender has recipient restrictions.

## 8. Seed Development Data

```bash
pnpm --dir server seed
pnpm --dir server seed -- --fresh
```

`--fresh` deletes seed-relevant data before recreating it. Never run it against
a production database.

Important: the current candidate seed path uses `User.insertMany()`, which does
not execute the password-hashing `save` hook. Seeded candidate credentials are
therefore unsafe and may not authenticate as advertised. Fix that path before
using seeded accounts beyond disposable local data; see
[Project Status](./PROJECT_STATUS.md).

## 9. Quality Checks

From the repository root:

```bash
pnpm verify
```

The client build produces a Next.js production bundle. The server build emits
`server/dist/server.js`, which runs with `pnpm --dir server start`.

## Common Problems

| Symptom                                            | Check                                                                                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Startup reports a missing environment variable     | Compare `server/.env.local` with `server/.env.example`; Cloudinary and Resend are required too.                                        |
| MongoDB connection times out                       | Check the Atlas IP allowlist, credentials, database name, and URL encoding.                                                            |
| Transaction errors                                 | Use Atlas or a MongoDB replica set instead of a standalone server.                                                                     |
| Browser reports CORS errors                        | Make `CLIENT_ORIGIN` exactly match the client scheme, host, and port.                                                                  |
| Refresh cookie is not sent                         | Use the same-origin proxy, HTTPS, and `/api/v1` values described above; direct cross-site use conflicts with the strict cookie policy. |
| Search routes fail or return no data               | Run `search:setup`, wait for Atlas indexes, and confirm the configured index names.                                                    |
| Emails fail                                        | Check `RESEND_API_KEY`, `EMAIL_FROM`, sender verification, and Resend recipient restrictions.                                          |
| Uploads fail                                       | Check all three Cloudinary variables, MIME type, and upload-size limits.                                                               |
| Client API requests target localhost in production | Set `API_PROXY_TARGET` to the deployed API URL and rebuild/redeploy the client.                                                        |
| Server lint cannot resolve `@eslint/js`            | Reinstall workspace dependencies with the requested pnpm version; a stale local symlink can survive package changes.                   |
| Type-check passes but runtime fails                | Boot the applications and exercise the affected endpoint; types do not validate middleware or external services.                       |

Do not commit `.env`, `.env.local`, credentials, access tokens, or production
database URLs.
