# Deployment

Credify builds into two production processes:

- a Next.js client started with `pnpm --dir client start`; and
- a compiled Express API started with `pnpm --dir server start`.

The repository is deployable on any Node.js host that supports separate client
and API services. It does not currently include a provider-specific manifest or
container image.

## Runtime Requirements

- Node.js 22.13 or newer
- pnpm 11.9
- HTTPS for both public services
- MongoDB Atlas or another replica-set deployment
- Cloudinary credentials
- Resend credentials and a verified sender

Install and build from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm verify
```

The build produces `.next/` for the client and `server/dist/server.js` for the
API. Build with development dependencies available; install/prune production
dependencies only after compilation.

## Recommended Topology

Keep browser API calls same-origin and let Next.js proxy them to the API:

```text
Browser -> https://app.example.com/api/v1/*
        -> Next.js rewrite
        -> https://api.example.com/api/v1/*
```

This topology preserves the strict, secure refresh cookie without requiring a
cross-site cookie. Configure the client service with:

```dotenv
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=https://api.example.com/api/v1
```

`API_PROXY_TARGET` is server-only. `NEXT_PUBLIC_API_BASE_URL` is embedded in the
client bundle and must remain `/api/v1` for the recommended proxy topology.
Direct browser calls to an API on a different site are not compatible with the
current `SameSite=Strict` refresh cookie.

## API Environment

Configure these values on the API host:

```dotenv
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://app.example.com
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/credify_prod
JWT_ACCESS_SECRET=<at-least-32-random-characters>
JWT_REFRESH_SECRET=<different-at-least-32-random-characters>
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM="Credify <noreply@example.com>"
```

The server exits before listening when required variables, origins, port, or
production JWT secret lengths are invalid. `CLIENT_ORIGIN` accepts a
comma-separated list of exact HTTP/HTTPS origins without paths.

Never run the seed script against production. Provision the Atlas Search
indexes with `pnpm --dir server search:setup` using the production database
configuration, then wait for Atlas to report them ready.

## Start Commands

Start the API:

```bash
pnpm --dir server start
```

Start the client:

```bash
pnpm --dir client start
```

The API process connects to MongoDB before opening its HTTP listener. Configure
the platform health check as `GET /health`; a healthy response returns HTTP 200
with `data.status` equal to `ok`.

## Release Gate

Run these checks in a network-enabled CI or release environment:

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm audit --prod
```

Then verify against production credentials and domains:

1. `GET /health` and `GET /api/v1` return HTTP 200.
2. The client can register, verify email, sign in, refresh, and sign out.
3. Candidate avatar and resume upload, replacement, and removal work.
4. Job search works after both Atlas Search indexes become ready.
5. Allowed origins receive credentialed CORS headers; untrusted origins do not.
6. Logs redact credentials, tokens, cookies, password fields, and `Set-Cookie`.
7. A database backup and rollback procedure has been tested.

## Current Release Decision

The build and startup contract is implemented, but public production release
remains conditional. Resolve or explicitly accept the P1 authorization and data
integrity risks in [Project Status](./PROJECT_STATUS.md), add a network-enabled
dependency advisory check, and verify Atlas, Resend, Cloudinary, DNS, HTTPS, and
cookie behavior in the target environment before approving launch.
