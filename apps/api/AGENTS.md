# API — local agent facts

Workspace: `@platform/api`, independent Fastify process on port 3200. Public path ownership: an **independent hostname**, e.g. `api.example.com`, not `web /api/*`.

Actual endpoints: `GET /health` (not public API), `GET /v1/ping`, `GET /openapi.json` and optional Swagger UI `/docs`. The ping endpoint is public and has no user/business data. API keys/JWT are NOT implemented; add real auth before private data.

Source in `code/`, route registry `code/routes/index.ts`, tests in `tests/`. Read root architecture, do not copy global rules here.
