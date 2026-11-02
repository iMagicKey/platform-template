# API — local agent facts

Workspace `@platform/api`, independent Fastify HTTP process, internal port **3200**, intended for its own hostname (not the main web's /api prefix). Global naming and layout: root `docs/ARCHITECTURE.md`.

- `code/index.ts`: process lifecycle; `code/app.ts`: Fastify composition, Pino, Zod, Swagger, rate limits.
- `code/config.ts`: Zod env. `code/consts/app.ts`: service name/version.
- `code/routes/index.ts`: only central HTTP registrar; `routes/health/index.ts` maps `GET /health`; `routes/v1/ping.ts` maps `GET /v1/ping`.
- `code/modules/ping.ts`: example isolated domain function (returns pong).
- `GET /openapi.json`, `/docs` optionally expose public API docs.
- Authentication, API-key management, persistent users and DB are NOT implemented yet.

Start `pnpm dev:api`, test `pnpm --filter @platform/api test`, build `pnpm --filter @platform/api build`. See `.env.example` for local port, logging and Swagger UI switch.
