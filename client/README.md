# Credify Client

The client is a Next.js App Router application in the Credify pnpm workspace.
Run commands from the repository root unless a package-specific command is
needed.

```bash
pnpm --dir client dev
pnpm --dir client build
pnpm --dir client start
```

Browser requests default to `/api/v1` and are proxied by Next.js to the
server-only `API_PROXY_TARGET`. Copy `.env.example` to `.env.local` for local
development.

See the root [README](../README.md), [Environment Setup](../docs/ENVIRONMENT_SETUP.md),
and [Deployment](../docs/DEPLOYMENT.md) for the complete project workflow.

The implemented routes cover public jobs/company profiles, authentication,
candidate dashboard/profile/application history, and recruiter dashboard,
company/profile settings, job management, applicant pipelines, candidate
search, and saved candidates. `/` renders a public landing page or a
personalized member overview. Dedicated admin management and a full
notification-feed page remain pending.

The root layout initializes identity from the unsigned `credify-auth-user`
snapshot. `src/proxy.ts` handles initial route redirects, with client role/guest
guards for navigation. Access tokens remain in memory; the shared API client
restores them using the HTTP-only refresh cookie before protected requests.
The shared header listens for process-local SSE application events.

See [Project Status](../docs/PROJECT_STATUS.md) for current limitations and
[Architecture Decisions](../docs/DECISIONS.md) for authentication/realtime details.
