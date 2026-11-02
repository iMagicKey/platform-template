# Universal Platform Template v1 — Architecture

**Status:** approved baseline, 2026-11-02. **Runtime:** Node.js 26 LTS. This is a runnable monorepo, not a framework or profile generator.

## Boundaries and filesystem

- `apps/*`: independent services, with their own build/start/test/config/logs and release lifecycle. No direct app-to-app source imports.
- `packages/*`: only reusable in-house code with demonstrable need; npm libraries (Pino, jose, grammY, iMagic Scheduler, Zod) are installed directly.
- `system/*`: utilities for initialization, systemd, certificates, logs and architecture checks.
- `deploy/*`: versioned deployment configuration, initially Caddy; no secrets.
- `runtime/*`: untracked secrets/certificates; allow external location via environment.
- Backend services: `code/` source, `data/` checked-in fixed data, `storage/` mutable files, `logs/` untracked logs, `tests/` tests, root `AGENTS.md` for *local facts*.
- Next.js: `src/app` App Router; `src/components`, `containers`, `consts`, `hooks`, `libs`, `providers`, `store`, `tests`, `utils` for specific concerns; `public/` static assets.
- Documentation: this global architecture file and root/local `AGENTS.md`; add other Markdown only for a demonstrated need. Never Markdown in `code/`.

## Standards

- Workspaces: pnpm + Turborepo; TypeScript strict; independent `dev`, `build`, `start`, `test`, `typecheck`, `lint`.
- Next.js runs using its own native server, **not** a custom Fastify Next.js wrapper.
- Fastify for HTTP/WS, Zod for input/output and env validation; Pino structured JSON logs. pino-roll only when filesystem logging is enabled. systemd defaults to journald/stdout.
- Each backend: `code/config.ts` for validated env, `code/consts` for constants; `code/db` optional ORM-agnostic database example; `code/modules` for reusable/testable domain logic.
- Routes: `code/routes/index.ts` is the *only* central route registration file; `routes/auth/index.ts` maps `/auth`; `routes/auth/login.ts` maps `/auth/login`. Files do not autogenerate routes. Small endpoints may be single files. A central registry must explicitly register every route and test path/method uniqueness.
- An internal Fastify path `/auth/login` may be exposed externally as `/api/auth/login` by stripping the prefix in Caddy. `/api/*` under the public web origin is owned by Fastify, not Next.js route handlers.
- Multiple independent APIs may receive different domains or path prefixes, and versions (`/v1`, `/v2`) can route to different processes.
- Public APIs may expose Zod-derived OpenAPI `/openapi.json` and Swagger UI `/docs` with secure visibility controls.
- Auth: browser-session in host-only Secure/HttpOnly cookie, JWT with issuer/audience/exp for service or API scope, API keys for external clients, Telegram initData verification where applicable. Do not share auth cookies across subdomains by default; use BFF or explicit limited-lifetime token exchange.
- `/health` on each HTTP app: status, ready, service, version and release. Web checks its own no-store release and can show a user-initiated refresh banner. No Next.js deploymentId.
- Runtime logs: service, environment, release, requestId/traceId and optional authenticated userId; redact tokens/cookies/passwords. No whole body logging. Retention/rotation for file mode.
- Graceful SIGINT/SIGTERM: stop new requests/tasks, drain HTTP/WS, stop scheduler, release DB/Redis resources and flush logs with a deadline.
- Scheduler: existing **npm iMagic Scheduler** package, one designated worker/replica per job. No custom scheduler copied into packages.
- TLS: direct Fastify HTTPS with manually supplied PEM or self-signed; Next.js behind TLS termination; Caddy offers single ingress for Next.js + Fastify/WS. Cloudflare Full or Full (strict) optional. Kubernetes and public IP CA automation explicitly excluded from v1.
- Release: graceful stop, update, restart, health-check; brief downtime accepted. No rolling/blue-green.
- Tests: independent per app, contract tests, public route ownership checks, no cross-app source imports. Database migrations and backups are outside v1.
