# Universal Platform Template

Node.js 26 LTS, strict TypeScript, pnpm/Turborepo, independent Next.js and Fastify apps.

Architecture contract: [ARCHITECTURE.md](ARCHITECTURE.md). AI instructions: [AGENTS.md](AGENTS.md).

## Quick start

```bash
corepack enable
pnpm install
pnpm dev
```

Default local services: Next.js web `http://127.0.0.1:3000`, Fastify backend `http://127.0.0.1:3100`, independent API `http://127.0.0.1:3200`. App-specific launch and tests: `pnpm dev:web`, `pnpm dev:backend`, `pnpm dev:api`, `pnpm --filter @platform/backend test`.

```bash
pnpm check:architecture
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Caddy's sample is in `deploy/caddy/Caddyfile`. Copy example env files before customizing. Secrets and certificates belong outside Git under `runtime/` or an external secured mount.
