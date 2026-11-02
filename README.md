# Universal Platform Template

**Node.js 26 LTS** · TypeScript · pnpm + Turborepo · native Next.js · independent Fastify backend and API.

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the architecture contract and [AGENTS.md](AGENTS.md) for agent instructions.

## Quick start

```bash
git clone https://github.com/iMagicKey/platform-template.git
cd platform-template

npm install -g pnpm@10.21.0
pnpm install
pnpm system:init
pnpm dev
```

Development services: native Next.js `http://127.0.0.1:3000`, backend `http://127.0.0.1:3100`, independent API `http://127.0.0.1:3200`. No external service, database, Telegram token or authentication credentials required to start.

```bash
pnpm dev:web
pnpm dev:backend
pnpm dev:api
pnpm dev:worker
pnpm dev:bot
pnpm --filter @platform/backend test
pnpm check:architecture
pnpm format:check
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

The example is deliberately HTTP for local work. A production HTTPS example with _imported_ PEM is at `deploy/caddy/Caddyfile.production.example`. Certificates, keys and production proxy config never enter Git.

## Operations

```bash
pnpm system:certs self-signed backend localhost
pnpm build
pnpm system:service install backend # preview unit
pnpm system:service install backend --apply # needs permissions
pnpm system:logs show backend
pnpm system:logs clear backend
```

The systemd installer generates a reviewable unit without requiring root; `--apply` requires privileges. The default output uses journald, with optional app-level file logging via `LOG_OUTPUT=file`. Runtime directories and `.env` are gitignored.

**Security:** `POST /auth/login` deliberately returns 501 until an actual identity provider is installed. WebSocket example requires a development-only token and allowed Origin. Never deploy examples as authentication.

## Directory semantics and naming

[ARCHITECTURE.md](ARCHITECTURE.md) defines the exact responsibilities of every `apps/*/code` and `apps/web/src` directory,
plus React PascalCase naming, camelCase TypeScript, lowercase routes and snake_case SQL. The rules are checked by ESLint and
`pnpm check:architecture`. UI examples include a Zustand-powered service explorer: filters, favorites, search, scoped store
provider and independent store tests.

## Notes

- `apps/*/AGENTS.md` documents only app-specific facts. No Markdown in backend `code/`.
- Per-app `.env.example` is committed; `.env` and `runtime/` are not.
- Worker uses the published imagic-scheduler npm package; bot uses grammY but remains disabled without BOT_ENABLED and BOT_TOKEN.
- Database adapter is an unconnected example; no mandatory DB or migrations.

## Commit conventions

Use `type(scope): imperative summary` (Conventional Commits). For example, `feat(web): add dashboard filters` or
`fix(backend): reject invalid tokens`. Scope is optional; keep the header at most 72 characters. Detailed rules and
breaking-change notation are in [ARCHITECTURE.md](ARCHITECTURE.md). Validate with `pnpm check:commit`.
