# API — local agent facts

Workspace `@platform/api`, independent Fastify HTTP process, internal port **3200**, intended for its own hostname (not the main web's /api prefix). Global naming and layout: root `docs/ARCHITECTURE.md`.

- `code/index.ts`: process lifecycle with a 10-second shutdown deadline that remains armed after `app.close()`; `tests/index.test.ts` exercises clean exit and lingering handles through the real entry point. `code/app.ts`: Fastify composition, Pino, Zod, Swagger, rate limits.
- `code/logging.ts` builds Pino options using explicit `if` for file transport; `code/plugins/request-logging.ts` owns the request-completion hook; infrastructure assembly stays readable in `app.ts`.
- Each HTTP route keeps its `const ...RouteSchema` above its exported register function in the same file. Reused JSON response types and Zod factories are imported from the monorepo package `@platform/api-contract` (`packages/api-contract/`); the former `code/schemas/common.ts` has been removed. Do not mirror `routes/` inside `schemas/`.
- `code/config.ts`: Zod env. `code/consts/app.ts`: service name/version.
- `code/routes/index.ts`: only central HTTP registrar; `routes/health/index.ts` maps `GET /health`; `routes/v1/ping.ts` maps `GET /v1/ping`.
- `code/modules/ping.ts`: example isolated domain function (returns pong).
- `GET /openapi.json` and `/docs` are both disabled by default in production and require DOCS_ENABLED=true to publish.
- Authentication, API-key management, persistent users and DB are NOT implemented yet.

Start `pnpm dev:api`, test `pnpm --filter @platform/api test`, build `pnpm --filter @platform/api build`. See `.env.example` for local port, logging and Swagger UI switch.

- `@platform/api-contract` owns JSON response envelopes for application routes such as `GET /v1/ping`; `code/plugins/error-handler.ts` maps Fastify errors, including malformed URL encoding via the bootstrap `frameworkErrors` callback. `/health` and `/openapi.json` keep native payloads.
