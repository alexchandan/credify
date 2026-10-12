# Deployment

Credify builds into two production processes:

- a Next.js client started with `pnpm --dir client start`; and
- a compiled Express API started with `pnpm --dir server start`.

The repository is deployable on any Node.js host that supports separate client
and API services. It does not currently include a provider-specific manifest or
container image.

**Last reviewed:** 2026-10-03 · **Workspace version:** 1.6.1

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

This is the default client topology. Configure the client service with:

```dotenv
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=https://api.example.com/api/v1
```

`API_PROXY_TARGET` is server-only. `NEXT_PUBLIC_API_BASE_URL` is embedded in the
client bundle and must remain `/api/v1` for the recommended proxy topology.
The API refresh cookie uses `SameSite=None; Secure` in production (as of 1.6.1),
`SameSite=Lax` otherwise, and path `/api/v1/auth` in both cases. Production
requires HTTPS. Direct cross-origin requests can use the production cookie, but
need the client origin in `CLIENT_ORIGIN`, credentialed requests, and browser
acceptance of third-party cookies. Prefer the proxy to reduce that dependency.
The separate `credify-auth-user` snapshot cookie is written by the client on the
app origin for initial rendering and routing; it is not an API credential.

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

## Background Cleanup and Realtime

The API starts an account-purge sweep after connecting to MongoDB and repeats
it every hour. This is an in-process timer, with no distributed lock; multiple
API instances can run concurrent sweeps. Every user with `deletedAt` older than
seven days is eligible, including administratively suspended users under the
current schema. Review the recovery/moderation risks in
[Project Status](./PROJECT_STATUS.md) before relying on this lifecycle.

`GET /api/v1/notification/stream` holds an SSE connection open and sends
heartbeat comments every 25 seconds. Configure proxy buffering and idle timeouts
for streaming. Event delivery is process-local; connections to one instance do
not receive events emitted by another without a shared delivery mechanism.
Stream URLs contain an access token, so URL logging must account for it.

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
7. Candidate application history/withdrawal and recruiter create/edit/publish,
   review/status changes, candidate discovery, and saved notes work.
8. SSE connects after sign-in and reload, delivers events, and reconnects after
   token expiry under the intended proxy and instance topology.
9. Account deletion/recovery and cleanup preserve intended moderation and
   retention behavior on a disposable dataset.
10. A database backup and rollback procedure has been tested.

## Current Release Decision

The build and startup contract is implemented, but this documentation review
does not certify the deployed environment. Resolve or explicitly accept the
P1 authorization and data integrity risks in [Project Status](./PROJECT_STATUS.md), add a network-enabled
dependency advisory check, and verify Atlas, Resend, Cloudinary, DNS, HTTPS, and
cookie behavior in the target environment before approving launch.
