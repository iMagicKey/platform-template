# Backend — local agent facts

Workspace `@platform/backend`, Fastify port **3100**, public `/api/*` via Caddy prefix stripping, public WebSocket `/ws`. Global naming and directory rules are in root ARCHITECTURE.md.

Actual implementations:

- `code/index.ts` starts/stops the process; `code/app.ts` assembles Fastify/Zod/Pino/OpenAPI/WebSocket/rate limiting.
- `code/config.ts` validates env; `code/consts/app.ts` holds fixed version and service name.
- `code/routes/index.ts` is the single HTTP registry.
- `code/routes/health/index.ts`: `GET /health`; `auth/index.ts`: `GET /auth`; `auth/login.ts`: `POST /auth/login`, always **501 AUTH_NOT_CONFIGURED** until a real provider is installed.
- `code/modules/auth/auth.service.ts` is the currently disabled identity provider boundary; `jwt.ts` supplies jose JWT issue/verify primitives but no session backend.
- `code/websocket/index.ts` supplies `/ws` heartbeat and development-only origin/token check. Never treat the demo ticket as production auth.
- `code/db/client.ts`, `code/db/models/User.ts`: unconnected ORM-neutral database examples.
- `GET /openapi.json`, optional `/docs` Swagger UI.

See `.env.example` for `HOST`, `PORT`, `LOG_OUTPUT`, `DOCS_ENABLED`, `HTTPS_ENABLED`, TLS paths and WS development settings. Use `pnpm dev:backend` and `pnpm --filter @platform/backend test`; no real user database/auth is configured.
