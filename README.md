# Universal Platform Template

**Node.js 26 LTS** · TypeScript · pnpm + Turborepo · native Next.js · independent Fastify backend and API.

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the architecture contract and [AGENTS.md](AGENTS.md) for agent instructions.

## Quick start

```bash
corepack enable
pnpm install
pnpm system:init
pnpm dev
```

Development services: native Next.js `http://127.0.0.1:3000`, backend `http://127.0.0.1:3100`, independent API `http://127.0.0.1:3200`. No external service, database, Telegram token or authentication credentials required to start.

```bash
pnpm dev:web
pnpm dev:backend
pnpm dev:api
pnpm --filter @platform/backend test
pnpm check:architecture
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Optional single-port ingress

With Caddy installed:

```bash
caddy run --config deploy/caddy/Caddyfile
```

Sample Caddy routing:
- `http://localhost:8080/` → Next.js
- `http://localhost:8080/api/health` → backend internal `/health`
- `http://localhost:8080/ws` → backend WebSocket
- `http://localhost:8081/v1/ping` → independent API
- `http://localhost:8081/docs` → API Swagger UI

The example is deliberately HTTP for local work. A production HTTPS example with *imported* PEM is at `deploy/caddy/Caddyfile.production.example`. Certificates, keys and production proxy config never enter Git.

## Operations

```bash
pnpm system:certs self-signed backend localhost
pnpm system:service install backend
pnpm system:service install backend --apply
pnpm system:logs show backend
pnpm system:logs clear backend
```

The systemd installer generates a reviewable unit without requiring root; `--apply` requires privileges. The default output uses journald, with optional app-level file logging via `LOG_OUTPUT=file`. Runtime directories and `.env` are gitignored.

**Security:** `POST /auth/login` deliberately returns 501 until an actual identity provider is installed. WebSocket example requires a development-only token and allowed Origin. Never deploy examples as authentication.

## Notes

- `apps/*/AGENTS.md` documents only app-specific facts. No Markdown in backend `code/`.
- Per-app `.env.example` is committed; `.env` and `runtime/` are not.
- Scheduler and grammY are intentionally not bootstrapped until concrete package API and token/integration requirements are verified.
- Database adapter is an unconnected example; no mandatory DB or migrations.
