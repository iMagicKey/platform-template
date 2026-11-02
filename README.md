# Universal Platform Template

**Node.js 26 LTS** · TypeScript · pnpm + Turborepo · native Next.js · independent Fastify backend and API.

Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the architecture contract and [AGENTS.md](AGENTS.md) for agent instructions.

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

## Optional single-port ingress (Caddy)

Caddy is a small reverse proxy that exposes Next.js and Fastify through a single address. On Ubuntu/Debian, a basic installation is:

```bash
sudo apt update
sudo apt install -y caddy
```

For newer releases or other operating systems, see the [official installation guide](https://caddyserver.com/docs/install).
The package automatically starts a systemd service. Stop it **only when running the local Caddyfile manually** to avoid a port/admin API conflict:

```bash
sudo systemctl stop caddy
caddy validate --config deploy/caddy/Caddyfile
```

Start web/backend/API with `pnpm dev`, then launch Caddy from the repository root:

```bash
caddy run --config deploy/caddy/Caddyfile
```

Sample Caddy routing:

- `http://localhost:8080/` → Next.js
- `http://localhost:8080/api/health` → backend internal `/health`
- `http://localhost:8080/ws` → backend WebSocket
- `http://localhost:8081/v1/ping` → independent API
- `http://localhost:8081/docs` → API Swagger UI

The example is deliberately HTTP for local work. It uses `handle_path /api/*` to strip the `/api` prefix before forwarding requests to Fastify. You can change the internal ports in `deploy/caddy/Caddyfile`.

For a managed service on a VPS, start from `deploy/caddy/Caddyfile.production.example`: copy it to `/etc/caddy/Caddyfile`, set hostnames and certificate paths, and use `sudo caddy validate --config /etc/caddy/Caddyfile` followed by `sudo systemctl reload caddy`. Keep imported PEM/key files out of Git and readable only by the appropriate service account. Never run a second manual Caddy instance alongside the system service. See [Caddy documentation](https://caddyserver.com/docs/) for detailed setup.

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

**Security:** Auth is disabled by default. An explicitly configured development-only scrypt-backed demo provider is available, but is rejected in production. WebSocket example requires a development-only token and allowed Origin. Never deploy examples as authentication.

## Optional development authentication

The example auth is deliberately unavailable in production. To try the working login UI through Caddy on port 8080:

1. Generate a unique password hash without passing the plaintext in shell arguments:
   `read -rs PASSWORD; printf %s "$PASSWORD" | pnpm system:password; unset PASSWORD`
2. In `apps/backend/.env` set `AUTH_MODE=demo`, `AUTH_USERNAME=operator`, `AUTH_PASSWORD_HASH=<generated value>`, and `AUTH_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080`.
3. Start the backend and open `http://localhost:8080` with Caddy running. Login, `/auth/me`, and logout use an HttpOnly session cookie; browser code never stores credentials or tokens.

**Do not use this single-user demo identity provider in production.** Sessions are stored as hashed-token records in untracked `apps/backend/storage/auth/sessions.json` (or `AUTH_FILE_PATH`) and survive a restart, but no concurrent writers, distributed locking, backups or production account management are provided. A real storage adapter and stronger session policies must replace it before production login. The projects estimator runs without auth and demonstrates the full frontend-to-Fastify request path.

## Integration smoke test

With Next.js, backend, independent API and Caddy running, execute `pnpm system:smoke`. It verifies the ingress and public endpoints; unlike unit tests, it requires live services.

## Directory semantics and naming

[ARCHITECTURE.md](docs/ARCHITECTURE.md) defines the exact responsibilities of every `apps/*/code` and `apps/web/src` directory,
plus React PascalCase naming, camelCase TypeScript, lowercase routes and snake_case SQL. The rules are checked by ESLint and
`pnpm check:architecture`. UI examples include a Zustand-powered service explorer: filters, favorites, search, scoped store
provider and independent store tests.

## Notes

- `apps/*/AGENTS.md` documents only app-specific facts. No Markdown in backend `code/`.
- Per-app `.env.example` is committed; `.env` and `runtime/` are not.
- Worker uses the published imagic-scheduler npm package; bot uses grammY but remains disabled without BOT_ENABLED and BOT_TOKEN.
- `apps/backend/code/db/FileJsonStore.ts` and `FileSessionStore.ts` demonstrate validated, atomic single-process JSON storage for dev auth; no mandatory database or migrations.

## Commit conventions

Use `type(scope): imperative summary` (Conventional Commits). For example, `feat(web): add dashboard filters` or
`fix(backend): reject invalid tokens`. Scope is optional; keep the header at most 72 characters. Detailed rules and
breaking-change notation are in [ARCHITECTURE.md](docs/ARCHITECTURE.md). Validate with `pnpm check:commit`.
