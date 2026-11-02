# Backend — local agent facts

Workspace: `@platform/backend`. Source: `code/`; local tests: `tests/`. Public behind Caddy: `/api/*` (stripped on forwarding), WS: `/ws`. Internal port 3100.

Routes: `GET /health`, `GET /auth`, `POST /auth/login` (501 until real identity provider), and opt-in `GET /ws` WebSocket (requires explicitly configured development token and allowed origin). Public OpenAPI: `/openapi.json`, optional UI `/docs`.

No real login or database is configured; never promote examples to production authentication. Database adapter interface is intentionally disconnected until a driver is selected.

Read root `ARCHITECTURE.md` for standards. Do not duplicate it here. Check: `pnpm --filter @platform/backend test`, `typecheck`, `build`.
