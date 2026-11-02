# Universal Platform Template v1 — Architecture

**Status:** approved baseline, 2026-11-02. **Runtime:** Node.js 26 LTS. This is a runnable monorepo, not a framework or profile generator.

## Boundaries and filesystem

- `apps/*`: independent services, with their own build/start/test/config/logs and release lifecycle. No direct app-to-app source imports.
- `packages/*`: only reusable in-house code with demonstrable need; npm libraries (Pino, jose, grammY, iMagic Scheduler, Zod) are installed directly.
- `system/*`: utilities for initialization, systemd, certificates, logs and architecture checks.
- `deploy/*`: versioned deployment configuration, initially Caddy; no secrets.
- `runtime/*`: untracked secrets/certificates; allow external location via environment.
- Backend services: `code/` source, `data/` checked-in fixed data, `storage/` mutable files, `logs/` untracked logs, `tests/` tests, root `AGENTS.md` for _local facts_.
- Next.js: `src/app` App Router; `src/components`, `containers`, `consts`, `hooks`, `libs`, `providers`, `store`, `tests`, `utils` for specific concerns; `public/` static assets.
- Documentation: this global architecture file and root/local `AGENTS.md`; add other Markdown only for a demonstrated need. Never Markdown in `code/`.

## Standards

- Workspaces: pnpm + Turborepo; TypeScript strict; independent `dev`, `build`, `start`, `test`, `typecheck`, `lint`.
- Next.js runs using its own native server, **not** a custom Fastify Next.js wrapper.
- Fastify for HTTP/WS, Zod for input/output and env validation; Pino structured JSON logs. pino-roll only when filesystem logging is enabled. systemd defaults to journald/stdout.
- Each backend: `code/config.ts` for validated env, `code/consts` for constants; `code/db` optional ORM-agnostic database example; `code/modules` for reusable/testable domain logic.
- Routes: `code/routes/index.ts` is the _only_ central route registration file; `routes/auth/index.ts` maps `/auth`; `routes/auth/login.ts` maps `/auth/login`. Files do not autogenerate routes. Small endpoints may be single files. A central registry must explicitly register every route and test path/method uniqueness.
- Route-local Zod schemas belong in **the same route file**, declared as a `const <name>RouteSchema` **above** the exported registrar. Register with native Fastify `{ schema: <name>RouteSchema }`; do not mirror the route tree in a separate schemas directory or add a custom route-building DSL.
- Use optional `code/schemas/` **only for actually reused** HTTP contracts or validators (e.g. a shared error response); keep internal domain schemas close to their owning `modules/`. `consts/` holds static values, not schema definitions merely because a schema is declared with `const`. Keep HTTP response status keys numeric (`200`, `401`) and reuse schemas instead of hiding status contracts.
- Readable bootstrap: `code/logging.ts` constructs Pino options with explicit assignment and `if` for optional file transport. `code/plugins/request-logging.ts` owns Fastify request-completion events. For optional TLS, construct typed `FastifyServerOptions`, set `options.https` in an explicit `if`, and then call `Fastify(options)`. Avoid nested ternaries and conditional object spread in infrastructure configuration; they remain allowed for simple expressions elsewhere. Split helpers only when they improve clarity, not to hide one-line operations.
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

## Semantic ownership of directories — mandatory for agents

A directory is a _responsibility boundary_, not a catch-all. Prefer the smallest source file that implements the responsibility. Never create Markdown documentation inside source directories.

| Source                                     | Must contain                                                                                               | Must NOT contain                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/web/src/app/`                        | Next.js route convention files (`page.tsx`, `layout.tsx`, `route.ts`, etc.) and route-specific composition | Domain service implementations, globally shared UI         |
| `apps/web/src/containers/`                 | Screen-level orchestration and assembly of reusable UI, store and hooks                                    | Generic low-level buttons, database logic                  |
| `apps/web/src/components/`                 | Reusable typed, preferably presentational React components                                                 | App-wide process configuration or persistence              |
| `apps/web/src/hooks/`                      | React hooks with `use` prefix; shared lifecycle and hook composition                                       | Plain pure helpers                                         |
| `apps/web/src/providers/`                  | React context boundaries, per-subtree Zustand stores and shared UI contexts                                | Cross-request global mutable server state                  |
| `apps/web/src/store/`                      | Zustand state types, actions and store factories; local client-state concerns                              | Credentials and user session persistence by default        |
| `apps/web/src/consts/`                     | Immutable UI configuration and fixed business labels                                                       | Secrets or runtime-dependent server configuration          |
| `apps/web/src/libs/`                       | API clients, browser/server adapters, transport integrations                                               | Domain-driven UI components                                |
| `apps/web/src/utils/`                      | Pure reusable functions, formatters and transformations                                                    | API calls or React hooks                                   |
| `apps/web/src/tests/`                      | UI/store/hook tests of this frontend                                                                       | Tests of unrelated service internals                       |
| `apps/backend/code/index.ts`               | Node process lifecycle, listen, signal handling                                                            | Business functions or HTTP route definitions               |
| `apps/backend/code/app.ts`                 | Injectable Fastify construction, infrastructure registration                                               | Network listen, process exit                               |
| `apps/*/code/config.ts`                    | Zod-validated environment and defaults                                                                     | Fixed business constants or passwords                      |
| `apps/*/code/consts/`                      | Immutable domain constants                                                                                 | Env configuration                                          |
| `apps/*/code/logging.ts`                   | Pino logger options and optional file transport; explicit configuration                                    | HTTP request hooks or business functionality               |
| `apps/*/code/schemas/`                     | Only genuinely shared Zod HTTP contracts and validators                                                    | Mirrored route trees or isolated route schemas             |
| `apps/*/code/store.ts`                     | Optional typed process-local shared state and `createStore()` factory                                      | Persistent data, user/request state, DB transactions       |
| `apps/*/code/routes/index.ts`              | **Single central HTTP route registry**                                                                     | URL endpoint implementation                                |
| `apps/*/code/routes/<segment>/index.ts`    | HTTP endpoint for `/<segment>`, no extra URL segment                                                       | Sub-route registry                                         |
| `apps/*/code/routes/<segment>/<action>.ts` | HTTP method, path, Zod input/output schemas, HTTP-only auth and response logic                             | Complex business operations or database model logic        |
| `apps/*/code/modules/`                     | Domain and business logic reusable across routes, workers and tests                                        | Unnecessary Fastify request/reply types                    |
| `apps/*/code/db/`                          | Optional database adapter, entity definitions, connection lifecycle                                        | API response DTOs and public routes                        |
| `apps/*/code/db/models/`                   | One entity/model per file; naming specified below                                                          | Markdown instructions                                      |
| `apps/*/code/plugins/`                     | Fastify plugins, reusable HTTP request lifecycle hooks                                                    | Business case-specific handlers                            |
| `apps/*/code/websocket/`                   | Upgrade authentication, heartbeat, WS connection lifecycle and message dispatch                            | Unrelated HTTP route groups                                |
| `apps/*/code/utils/`                       | Generic pure helpers                                                                                       | Feature-specific business algorithms                       |
| `apps/worker/code/tasks/`                  | Independently testable scheduled job functions                                                             | Duplicated scheduler implementation                        |
| `apps/bot/code/`                           | grammY bot initialization and update handlers                                                              | General HTTP server unless explicitly requested            |
| `apps/*/data/`                             | Immutable versioned reference data (no secrets)                                                            | Runtime uploads                                            |
| `apps/*/storage/`                          | Mutable local runtime files, untracked                                                                     | Source code or credentials                                 |
| `apps/*/logs/`                             | Untracked per-app file logs                                                                                | Git-tracked application output                             |
| `apps/*/tests/`                            | Tests of this application only                                                                             | Another app's source imports                               |
| `apps/*/AGENTS.md`                         | Actual app-level routes, commands, integration requirements and special cases                              | Global standards already defined here                      |
| `system/*.ts`                              | Small standalone maintenance CLIs (`check.ts`, `init.ts`, `service.ts`, `certs.ts`, `logs.ts`)             | App business functionality; one-folder-per-script ceremony |
| `deploy/`                                  | Tracked sample configurations for Caddy and future deployment modes                                        | Actual certificate PEM, tokens or secrets                  |
| `runtime/`                                 | Untracked manually movable certificates and secrets                                                        | Committed source                                           |

Future Fastify apps must follow the same `code/` conventions regardless of their name. Worker/bot apps do not need an HTTP route registry if they do not serve HTTP.

## Server Runtime Store — process-local shared state

Each server application **may** have a small `code/store.ts` when multiple modules need access to the same mutable operational data. This is a plain typed object, **not** a class or a required library. It is distinct from client-side Zustand in Next.js.

- `createStore()` constructs a fresh object for independent tests or multiple Fastify instances; the default export is a convenience singleton for the **running Node.js process only**. Production passes that singleton to `buildApp()`; `buildApp()` without one creates isolated state.
- Only add fields that are used by more than one part of the application. The backend demo includes `activeConnections` (owned by WebSocket) and `lastProjectEstimateAt` (owned by the projects module); neither is required in other services.
- All application modules may **read** the shared state. Each mutable field or subsection has a **single owning module** that writes it; this is an architectural rule, not a TypeScript access-control guarantee.
- The owner may use **direct assignment** for simple synchronous changes, e.g. `state.activeConnections = clients.size`. Meaningful operations can be expressed via an owner function, e.g. `markProjectEstimated(state)`. Both methods are demonstrated and tested.
- No universal mutex, event bus, subscribers or serialization framework. When a real module has competing asynchronous writes, that module handles ordering, versions or locking according to its business semantics; do not ignore races across `await`.
- No request-specific, tenant-specific or user-private data in global process state. No persistence or cross-process coordination is provided; use `db/`, an appropriate durable adapter, or an external coordinator for those purposes. Static configuration remains in `config.ts` or `consts/`.
- Avoid direct imports of the **default singleton** inside request handlers that must be independently instantiated by Fastify tests. Pass the per-app store by dependency to routes/modules instead; `code/index.ts` is where the process-wide default is attached to the actual app instance.
- If a feature's state is only used within one domain module, keep it inside that module rather than expanding the common object.

## Naming conventions — normative

Use **PascalCase** for React components/classes/entities, **camelCase** for JavaScript members/functions, **snake_case** for physical SQL identifiers, and **kebab-case** for public URL path segments. Do not confuse camelCase and PascalCase. Follow reserved framework filenames even when they are exceptions.

| Semantic element                                   | Naming                                    | Examples                                                             |
| -------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| React component/container/provider file and export | PascalCase                                | `ServiceCard.tsx`, `HomeContainer.tsx`, `DashboardStoreProvider.tsx` |
| TypeScript class, interface, type, enum            | PascalCase (no I/T prefix for interfaces) | `UserService`, `UserRecord`, `UserStatus`                            |
| Database ORM entity/model file                     | Singular PascalCase                       | `User.ts`, `UserSession.ts`, `User.prisma` where ORM supports this   |
| React hook file and function                       | camelCase with `use` prefix               | `useDashboardStore.ts`, `useRelease.ts`                              |
| Zustand store factory module                       | camelCase                                 | `dashboardStore.ts`, `createDashboardStore()`                        |
| Ordinary function/variable/method/parameter        | camelCase                                 | `registerAuthLogin`, `getUserById`, `userId`                         |
| Named static constant shared as a constant         | UPPER_SNAKE_CASE                          | `MAX_RETRIES`, `APP_VERSION`                                         |
| Local `const` variable, even if immutable          | camelCase                                 | `const user = await getUser()`                                       |
| Zod schema value                                   | camelCase + `Schema`                      | `loginRequestSchema`, `userResponseSchema`                           |
| Route segment / route file                         | lowercase / kebab-case                    | `auth/login.ts`, `auth/reset-password.ts`                            |
| Domain or integration folder                       | lowercase / kebab-case                    | `modules/auth/`, `modules/user-profile/`                             |
| Backend implementation file                        | lowercase or dot-qualified filename       | `auth.service.ts`, `config.ts`, `jwt.ts`                             |
| Browser-client API JSON field and Pino log field   | camelCase                                 | `userId`, `createdAt`, `requestId`, `traceId`                        |
| SQL table                                          | plural snake_case                         | `users`, `user_sessions`                                             |
| SQL column                                         | snake_case                                | `id`, `user_id`, `created_at`, `is_active`                           |
| ENV variable                                       | UPPER_SNAKE_CASE                          | `DATABASE_URL`, `APP_RELEASE`                                        |
| Public path                                        | lowercase / kebab-case                    | `/auth/reset-password`, `/v1/users`                                  |
| URL/path parameter / TypeScript property           | camelCase                                 | `:userId`, `[userId]`                                                |
| HTTP error code                                    | UPPER_SNAKE_CASE string                   | `AUTH_NOT_CONFIGURED`                                                |
| Event name                                         | dot-delimited lowercase semantic tokens   | `http.request.completed`, `auth.login.failed`                        |
| Tests                                              | Source name + `.test.ts(x)`               | `UserCard.test.tsx`, `auth.service.test.ts`                          |
| CSS custom property                                | kebab-case                                | `--primary-color`                                                    |

**Boolean members** should express the predicate (`isActive`, `hasAccess`, `canRetry`); timestamp fields prefer `createdAt`, `updatedAt`, `expiresAt` in TypeScript and `created_at`, `updated_at`, `expires_at` in SQL. Acronyms in compound identifiers use normal word casing: `userId`, `apiClient`, `jwtToken`, `ApiClient` (not `userID` or `APIClient`).

**Database layering:** physical SQL tables are plural snake_case; typed ORM/domain entities are singular PascalCase and expose camelCase properties. An ORM handles explicit mapping, e.g. Prisma `@map("created_at")` and `@@map("user_sessions")`, or Drizzle column aliases/casing. Do not leak DB storage field names into JSON API. SQL-specific naming does not automatically apply to MongoDB or third-party databases.

**Framework/external exceptions:** Next.js requires `page.tsx`, `route.ts`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`; dynamic segments `[userId]` are permitted. HTTP header names, JWT claims (`iss`, `aud`, `sub`, `exp`), Telegram `initData` and externally imposed JSON keys must retain their protocol-defined form. Do not rename external APIs solely to satisfy lint.

**Enum-like wire values:** use explicit stable lower-case tokens, e.g. `'active'`, `'pending_review'`. Renaming wire/storage values is a compatibility change. Prefer `as const` or string unions when a TypeScript `enum` is unnecessary.

**Formatting:** adopt the old nodejs-service-template Prettier style: 4 spaces, single quotes, no semicolons, printWidth 150, trailingComma es5, arrowParens always. Prettier formats source but **does not** enforce file names or rename symbols; ESLint controls supported identifier conventions, while `system/check.ts` validates relevant file/path conventions. Avoid aggressive naming lint on external schema keys and generated files. Add no new Markdown files just for naming: keep this rule in the single architecture document.

## Commit messages — Conventional Commits

All new commits follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
type(scope): short imperative summary

Optional body: why and what was changed, beyond the subject.

BREAKING CHANGE: explain compatibility impact and any migration
```

- Allowed types: `feat` (new behavior), `fix` (bug), `refactor` (behavior-preserving code change), `perf` (performance), `docs` (documentation only), `test` (tests), `style` (formatting only; **not UI features**), `build` (dependencies or build tools), `ci` (automation), `chore` (other maintenance), `revert` (revert).
- A scope is optional, but preferred when one area is affected: `web`, `backend`, `api`, `worker`, `bot`, `system`, `deploy`, `architecture`, `deps`, `ci`. New app names may become scopes. Use lowercase/kebab-case.
- Write subjects **in English**, beginning with a lowercase imperative verb (e.g. `add`, `fix`, `remove`, `document`). Maximum **72 characters including type and scope**, no trailing period, no emoji. The subject describes the change, not a status report.
- One coherent purpose per commit. Separate refactoring, new behavior and unrelated formatting. Do not claim tests passed unless they actually ran.
- Use a blank line and an optional body to explain non-obvious rationale, risks, migration and test results. For an incompatible change append `!` before the colon (e.g. `feat(api)!: change token response`) and explain the impact in a `BREAKING CHANGE:` footer.
- No automatic semantic versioning, changelog generation, release automation or Git hooks in v1. This convention applies from its adoption onward; do not rewrite existing commit history.
- Run `pnpm check:commit` locally. GitHub Actions checks the **HEAD commit message** on each push; direct pushes are not blocked pre-receive, so a failed CI is retrospective.

Examples:

```text
feat(web): add dashboard filters with Zustand
fix(backend): reject invalid WebSocket tickets
refactor(system): flatten service maintenance scripts
docs(architecture): define route and model naming
test(api): cover OpenAPI contract responses
style(web): normalize JSX formatting
build(deps): update Fastify and Zod versions
ci: validate commit subjects on push
chore: synchronize workspace lockfile
```

### Demonstration database adapter

The first backend storage example uses `code/db/FileJsonStore.ts` with Zod validation, temporary-file atomic rename and in-process serialized updates. `FileSessionStore.ts` implements the `SessionStore` contract, persisting hashed development session tokens beneath untracked `apps/backend/storage/`. It is intentionally **single-writer**: atomic rename does not provide distributed locking or transactions. It must not be used for production authentication, and `AUTH_MODE=demo` is rejected in production. No ORM or database daemon is required by the template.

### Review gate before external deployment

Before any real VPS installation or additional external WebSocket deployment test, obtain an **independent read-only review** of the full repository, then the repository owner's manual approval. Review findings take precedence over extending scope. Local CI smoke tests on GitHub-hosted runners do not constitute external VPS deployment and may continue.
