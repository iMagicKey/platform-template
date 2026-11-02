# Backend — local agent facts

Workspace `@platform/backend`, Fastify port **3100**, public `/api/*` via Caddy prefix stripping, public WebSocket `/ws`. Global naming and directory rules are in root `docs/ARCHITECTURE.md`.

Actual implementations:

- `code/index.ts` starts/stops the process with a 10-second shutdown deadline that remains armed after `app.close()`; `tests/index.test.ts` exercises clean exit and lingering handles through the real entry point. `code/app.ts` assembles Fastify/Zod/Pino/OpenAPI/WebSocket/rate limiting.
- `code/logging.ts` builds Pino options using explicit `if` for file transport; `code/plugins/request-logging.ts` owns the request-completion hook; infrastructure assembly stays readable in `app.ts`.
- Each HTTP route keeps its `const ...RouteSchema` above its exported register function in the same file. Reused JSON response types and Zod factories are imported from the monorepo package `@platform/api-contract` (`packages/api-contract/`); the former `code/schemas/common.ts` has been removed. Do not mirror `routes/` inside `schemas/`.
- `code/modules/auth/auth.factory.ts` wires the optional development-only auth provider.
- `code/config.ts` validates env; `code/consts/app.ts` holds fixed version and service name.
- `code/store.ts` exports the process-local singleton and `createStore()`. Current fields are `activeConnections` (written directly by WebSocket) and `lastProjectEstimateAt` (written through `modules/projects/projects.service.ts`). `code/index.ts` supplies the singleton to `buildApp`; tests default to fresh isolated stores.
- `code/routes/index.ts` is the single HTTP registry.
- `code/routes/health/index.ts`: `GET /health`; `auth/index.ts`: `GET /auth`; `auth/login.ts`: `POST /auth/login`, returns **501** by default, or authenticates a single demo account when AUTH_MODE=demo on non-production. `POST /auth/logout` and `GET /auth/me` use the same revocable file-backed development cookie session. Demo authentication requires ALLOW_DEMO_AUTH=true and loopback HOST. Production auth requires a real persistent identity/session provider; demo mode is blocked in production.
- `code/modules/auth/auth.service.ts` is the currently disabled identity provider boundary; `jwt.ts` supplies jose JWT issue/verify primitives but no session backend.
- `code/websocket/index.ts` supplies `/ws` heartbeat and development-only origin/token check. Never treat the demo ticket as production auth.
- `code/db/FileJsonStore.ts` is a Zod-validated atomic JSON file adapter; `FileSessionStore.ts` persists hashed dev-session tokens through the `SessionStore` interface, using untracked `storage/auth/sessions.json` or `AUTH_FILE_PATH`. One writer only, not production-safe. `code/db/models/UserSession.ts` is its storage model; `User.ts` remains ORM-neutral example.
- `GET /projects` returns tracked `data/projects.json` via `modules/projects/projects.service.ts`; `POST /projects/estimate` validates numeric cents with Zod, calculates costs in pure domain logic and generates OpenAPI. No persistent writes.
- `GET /openapi.json` and `/docs` Swagger UI are both disabled by default in production; development docs use a Caddy-aware `/api` prefix.

See `.env.example` for `HOST`, `PORT`, `LOG_OUTPUT`, `DOCS_ENABLED`, `HTTPS_ENABLED`, TLS paths and WS development settings. Use `pnpm dev:backend` and `pnpm --filter @platform/backend test`; no real user database/auth is configured.

- Application JSON routes use `@platform/api-contract` (`sendData`, `sendError`, route-local `dataResponseSchema`/`errorResponseSchema`); `plugins/error-handler.ts` maps Fastify and validation errors, including malformed URL encoding via the bootstrap `frameworkErrors` callback. `POST /auth/logout` returns 200 with `{ data: null, error: null }`. `/health` and `/openapi.json` retain infrastructure-native responses. Shared transport schemas belong to `packages/api-contract`, not a mirrored route-level `schemas/` tree.
