# Universal Platform Template v1 — Architecture

**Status:** approved baseline, 2026-11-02. **Runtime:** Node.js 26 LTS. This is a runnable monorepo, not a framework or profile generator.

## Boundaries and filesystem

- `apps/*`: independent services, with their own build/start/test/config/logs and release lifecycle. No direct app-to-app source imports.
- `packages/*`: only reusable in-house code with demonstrable need, including the shared `packages/api-contract` HTTP envelope; npm libraries (Pino, jose, grammY, iMagic Scheduler, Zod) are installed directly.
- `system/*`: production utilities for initialization, systemd, certificates, logs and architecture checks. No test source lives in `system/`.
- `tests/`: all test files, grouped by `api`, `backend`, `bot`, `web`, `worker`, `api-contract`, and `system`; this is the only test-source tree.
- `deploy/*`: versioned deployment configuration, initially Caddy; no secrets.
- `runtime/*`: untracked secrets/certificates; allow external location via environment.
- Backend services: `code/` source, `data/` checked-in fixed data, `storage/` mutable files, `logs/` untracked logs, root `AGENTS.md` for _local facts_.
- Next.js: `src/app` App Router; `src/components`, `containers`, `consts`, `hooks`, `libs`, `providers`, `store`, `utils` for specific concerns; `public/` static assets.
- Documentation: this global architecture file and root/local `AGENTS.md`; add other Markdown only for a demonstrated need. Never Markdown in `code/`.

## Standards

- Workspaces: pnpm + Turborepo; TypeScript strict; independent `dev`, `build`, `start`, `test`, `typecheck`, `lint`.
- Next.js runs using its own native server, **not** a custom Fastify Next.js wrapper.
- Fastify for HTTP/WS, Zod for input/output and env validation; Pino structured JSON logs. pino-roll only when filesystem logging is enabled. systemd defaults to journald/stdout.
- Each backend: `code/config.ts` for validated env, `code/consts` for constants; `code/db` optional ORM-agnostic database example; `code/modules` for reusable/testable domain logic.
- Routes: `code/routes/index.ts` is the _only_ central **application** HTTP route registration file; bootstrap-generated OpenAPI routes and the WebSocket upgrade are infrastructure/protocol exceptions; `routes/auth/index.ts` maps `/auth`; `routes/auth/login.ts` maps `/auth/login`. Files do not autogenerate routes. Small endpoints may be single files. A central registry must explicitly register every route and test path/method uniqueness.
- Route-local Zod schemas belong in **the same route file**, declared as a `const <name>RouteSchema` **above** the exported registrar. Register with native Fastify `{ schema: <name>RouteSchema }`; do not mirror the route tree in a separate schemas directory or add a custom route-building DSL.
- Use optional `code/schemas/` **only for actually reused** HTTP contracts or validators (e.g. a shared error response); keep internal domain schemas close to their owning `modules/`. `consts/` holds static values, not schema definitions merely because a schema is declared with `const`. Keep HTTP response status keys numeric (`200`, `401`) and reuse schemas instead of hiding status contracts.
- Readable Fastify bootstrap: `code/logging.ts` constructs Pino options with explicit assignment and `if` for optional file transport; `code/plugins/request-logging.ts` owns HTTP request-completion events. For backend TLS, use a typed options object (`FastifyServerOptions & { https?: HttpsServerOptions }`), set `options.https` in an explicit `if`, and then call `Fastify(options)`. The API HTTP service has no direct TLS option in the current example. Prefer explicit branching to nested ternaries or conditional object spread in infrastructure configuration; simple expressions may still use those constructs. This explicit Pino-bootstrap convention describes the **Fastify applications**: bot and worker currently configure their own Pino instances at their process entry points. Split helpers only when they improve clarity, not to hide one-line operations.
- Control flow: Prefer guard clauses and early `return`/`throw` when they make terminal conditions clearer and reduce nesting. Avoid a redundant `else` after a branch that always exits; retain `if/else` when it better expresses two equal alternatives. Do not introduce a wrapper function solely to enable `return` at the top level of an ES module, where top-level `return` is invalid.
- An internal Fastify path `/auth/login` may be exposed externally as `/api/auth/login` by stripping the prefix in Caddy. Backend Swagger UI uses an external `/api` asset prefix and an OpenAPI server URL of `/api`; open the docs at `/api/docs/` in development. `/api/*` under the public web origin is owned by Fastify, not Next.js route handlers.
- Multiple independent APIs may receive different domains or path prefixes, and versions (`/v1`, `/v2`) can route to different processes.
- Fastify services expose Zod-derived OpenAPI `/openapi.json` and Swagger UI `/docs` only while DOCS_ENABLED is true; DOCS_ENABLED=auto enables local development/test docs and disables both endpoints in production. Explicit publication is an owner decision.
- Auth: the current development-only provider stores host-only HttpOnly session cookies with Secure set for HTTPS (direct or trusted proxy); non-production HTTP demos omit Secure. The sample JWT helper enforces issuer, audience, issued-at and expiry but is not wired to routes. API keys, real user authentication and Telegram initData verification are future integrations, not shipped features. Do not share auth cookies across subdomains by default; use BFF or explicit limited-lifetime token exchange.
- `/health` on each HTTP app: status, ready, service, version and release. Web checks its own no-store release and can show a user-initiated refresh banner. No Next.js deploymentId.
- Runtime logs: implemented service, environment, release and HTTP requestId fields; traceId and authenticated userId are future optional fields. Redact sensitive structured fields, avoid whole request bodies and do not log raw Telegram errors; preserve rotation/retention for file mode.
- Graceful SIGINT/SIGTERM: bound process shutdown, stop HTTP/WS and worker tasks, and flush logs where supported. DB/Redis cleanup is a future responsibility if those integrations are installed; no Redis server is shipped.
- Scheduler: existing **npm iMagic Scheduler** package, one designated worker/replica per job. No custom scheduler copied into packages.
- TLS: direct Fastify HTTPS with manually supplied PEM or self-signed; Next.js behind TLS termination; Caddy offers single ingress for Next.js + Fastify/WS. Cloudflare Full or Full (strict) optional. Kubernetes and public IP CA automation explicitly excluded from v1.
- Release: a documented operational policy (stop, update, restart, health-check) with brief downtime, not an implemented deployment automation. Set APP_RELEASE and NEXT_PUBLIC_RELEASE explicitly when adopting release tracking; no rolling/blue-green.
- Tests: all test sources reside in root `tests/<owner>/` and run using app-local scripts or `pnpm test:system`; a development-only `@platform/tests` workspace supplies direct test imports. No app-, package-, or system-local test files. The architecture checker includes negative fixtures for naming, imports, route uniqueness, and misplaced tests. Database migrations and backups are outside v1.

## HTTP API response contract — normative

The shared `packages/api-contract` workspace package is the **single owner** of the transport-only JSON response contract. `apps/backend` and `apps/api` consume its Zod factories and response builders; `apps/web` consumes shared response types and performs boundary shape checks in its API client. It depends on Zod, **not** Fastify or application source. Domain services (`modules/`) return normal domain data, `null`, or domain-specific failures; the envelope is created **only at the HTTP route boundary**.

Every **application JSON endpoint** emits exactly the two required top-level fields `data` and `error`:

```json
{ "data": { "id": "example" }, "error": null }
```

```json
{
    "data": null,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Request validation failed",
        "issues": [{ "path": ["items", 0, "quantity"], "code": "too_small", "message": "Invalid quantity" }]
    }
}
```

- **Success:** `error: null`; `data` may be any valid JSON value, including `null`, an empty array, a number, a string, an object, or a boolean. `undefined` and `BigInt` are not directly JSON-serializable.
- **Failure:** `data: null`; `error` is an object with required machine-readable `code` and safe human-readable `message`. `issues` is optional and describes multiple specific problems. Each issue has `path: (string | number)[]`, `code: string` and `message: string`. Do not return populated `data` alongside `error`.
- Preserve meaningful **HTTP status codes** (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, etc.). An error is not a `200` response. For a successful application action without content, return `200` and `sendData(null)` instead of `204 No Content`, because `204` cannot carry a JSON body.
- Keep route-local Zod response schemas above each route registrar. Use `dataResponseSchema(payloadSchema)` and `errorResponseSchema('EXACT_CODE')` from the common package, with explicit numeric HTTP keys. Return `sendData(value)` or `reply.code(status).send(sendError(code, message, issues?))`. These helpers build plain typed objects; they neither write to Fastify's `reply` nor determine HTTP status.
- Each Fastify application owns `code/plugins/error-handler.ts`: normalize validator failures, malformed JSON, unknown routes, rate-limit responses, and unhandled exceptions. Never expose stack traces, internal exception messages, SQL, or secrets in public `5xx` responses. Log sensitive internals only using Pino and applicable redaction.
- Infrastructure/protocol exceptions keep their native representations: `/health` readiness metadata, `/openapi.json`, Swagger UI (`/docs`), and WebSocket frames/upgrade protocol. Proxy-generated errors and network failures cannot be guaranteed to follow the application envelope.
- **Partial success:** For operations whose contract permits per-item failures, represent those inside the successful `data` payload, not by returning both `data` and `error` populated. No automatic Fastify `onSend` wrapper: explicit Zod response serialization and endpoint ownership stay intact.
- Changing existing application endpoints to the envelope is an **HTTP breaking change**; update frontend consumers, contract tests, and Caddy smoke checks together.

## Implementation status and deployment boundaries

**Implemented:** independent apps and builds; shared API response contract and transport error handlers; development-only file-backed demo authentication (explicit ALLOW_DEMO_AUTH and loopback binding); isolated state factory; localhost Caddy ingress; release metadata endpoints; local WebSocket development-ticket authentication; structured Pino logging; optional Swagger/OpenAPI docs and production-off defaults; bounded shutdown.

**Demonstrations / limitations:** demo sessions use single-writer JSON storage, not production identity; cookie Secure is conditional on a trusted HTTPS transport; health reports service availability, not deep database dependency readiness; Runtime Store fields are illustrative telemetry, not automatically exposed; no real persistent database, API keys, Redis, distributed scheduler lock or Telegram initData verification are shipped. `/ws` has no production credential provider. Do not enable development modes on public hosts.

**Deployment gate:** an independent read-only review of the exact tested commit and explicit owner approval are mandatory before VPS changes. A production WebSocket test is **blocked** until a real production authentication mechanism exists; restricted non-production staging would require a separate approved test plan, not relaxing the existing production guard. systemd units require `--user` (non-root) and application installation outside `/home`; writable storage/log directories must be created and owned by the service account.

**Toolchain:** Node 26, pnpm 12, ESLint 10, supported TypeScript 5.9. The pnpm lockfile is committed; build-script permissions are explicitly allowlisted and the minimum-release-age policy remains enabled. Major updates require peer-dependency verification, clean install, typecheck, tests, build, formatting check, production dependency audit and local Caddy smoke.

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
| `packages/api-contract/`                   | Shared transport response types, Zod factories and sendData/sendError                                      | Fastify plugins, app/domain logic, app-to-app imports      |
| `apps/web/src/utils/`                      | Pure reusable functions, formatters and transformations                                                    | API calls or React hooks                                   |
| `tests/web/`                               | UI/store/hook tests of this frontend                                                                       | Tests of unrelated service internals                       |
| `apps/backend/code/index.ts`               | Node process lifecycle, listen, signal handling                                                            | Business functions or HTTP route definitions               |
| `apps/backend/code/app.ts`                 | Injectable Fastify construction, infrastructure registration                                               | Network listen, process exit                               |
| `apps/*/code/config.ts`                    | Zod-validated environment and defaults                                                                     | Fixed business constants or passwords                      |
| `apps/*/code/consts/`                      | Immutable domain constants                                                                                 | Env configuration                                          |
| `apps/*/code/logging.ts`                   | Pino logger options and optional file transport; explicit configuration                                    | HTTP request hooks or business functionality               |
| `apps/*/code/schemas/`                     | Only genuinely shared Zod HTTP contracts and validators                                                    | Mirrored route trees or isolated route schemas             |
| `apps/*/code/plugins/error-handler.ts`     | App-local Fastify HTTP error normalization                                                                 | Domain business logic or shared transport schemas          |
| `apps/*/code/store.ts`                     | Optional typed process-local shared state and `createStore()` factory                                      | Persistent data, user/request state, DB transactions       |
| `apps/*/code/routes/index.ts`              | **Single central HTTP route registry**                                                                     | URL endpoint implementation                                |
| `apps/*/code/routes/<segment>/index.ts`    | HTTP endpoint for `/<segment>`, no extra URL segment                                                       | Sub-route registry                                         |
| `apps/*/code/routes/<segment>/<action>.ts` | HTTP method, path, Zod input/output schemas, HTTP-only auth and response logic                             | Complex business operations or database model logic        |
| `apps/*/code/modules/`                     | Domain and business logic reusable across routes, workers and tests                                        | Unnecessary Fastify request/reply types                    |
| `apps/*/code/db/`                          | Optional database adapter, entity definitions, connection lifecycle                                        | API response DTOs and public routes                        |
| `apps/*/code/db/models/`                   | One entity/model per file; naming specified below                                                          | Markdown instructions                                      |
| `apps/*/code/plugins/`                     | Fastify plugins, reusable HTTP request lifecycle hooks                                                     | Business case-specific handlers                            |
| `apps/*/code/websocket/`                   | Upgrade authentication, heartbeat, WS connection lifecycle and message dispatch                            | Unrelated HTTP route groups                                |
| `apps/*/code/utils/`                       | Generic pure helpers                                                                                       | Feature-specific business algorithms                       |
| `apps/worker/code/tasks/`                  | Independently testable scheduled job functions                                                             | Duplicated scheduler implementation                        |
| `apps/bot/code/`                           | grammY bot initialization and update handlers                                                              | General HTTP server unless explicitly requested            |
| `apps/*/data/`                             | Immutable versioned reference data (no secrets)                                                            | Runtime uploads                                            |
| `apps/*/storage/`                          | Mutable local runtime files, untracked                                                                     | Source code or credentials                                 |
| `apps/*/logs/`                             | Untracked per-app file logs                                                                                | Git-tracked application output                             |
| `tests/<app>/`                             | Tests of this application only                                                                             | Another app's source imports                               |
| `apps/*/AGENTS.md`                         | Actual app-level routes, commands, integration requirements and special cases                              | Global standards already defined here                      |
| `system/*.ts`                              | Small standalone maintenance CLIs (`check.ts`, `init.ts`, `service.ts`, `certs.ts`, `logs.ts`)             | App business functionality; one-folder-per-script ceremony |
| `deploy/`                                  | Tracked sample configurations for Caddy and future deployment modes                                        | Actual certificate PEM, tokens or secrets                  |
| `runtime/`                                 | Untracked manually movable certificates and secrets                                                        | Committed source                                           |

Future Fastify apps must follow the same `code/` conventions regardless of their name. Worker/bot apps do not need an HTTP route registry if they do not serve HTTP.

## Server Runtime Store — process-local shared state

Each server application **may** have a small `code/store.ts` for explicitly owned process-local operational state. Existing fields are illustrative write-only telemetry examples, not currently surfaced by a reader. This is a plain typed object, **not** a class or a required library. It is distinct from client-side Zustand in Next.js.

- `createStore()` constructs a fresh object for independent tests or multiple Fastify instances; the default export is a convenience singleton for the **running Node.js process only**. Production passes that singleton to `buildApp()`; `buildApp()` without one creates isolated state.
- Prefer fields with a real cross-module consumer; the current demonstration values have a single writer and are not yet read by an application endpoint. The backend demo includes `activeConnections` (owned by WebSocket) and `lastProjectEstimateAt` (owned by the projects module); neither is required in other services.
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

**Formatting:** adopt the old nodejs-service-template Prettier style: 4 spaces, single quotes, no semicolons, printWidth 150, trailingComma es5, arrowParens always. Prefer compact native Fastify route calls when Prettier preserves the layout, but accept its multiline callback formatting: `printWidth` is not a guarantee that all short route arguments remain on one line. Do not use `prettier-ignore` or change the global width solely to force that layout. Prettier formats source but **does not** enforce file names or rename symbols; ESLint controls supported identifier conventions, while `system/check.ts` validates relevant file/path conventions. Avoid aggressive naming lint on external schema keys and generated files. Add no new Markdown files just for naming: keep this rule in the single architecture document.

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
