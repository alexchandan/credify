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
