# Agent instructions — platform-template

Read **docs/ARCHITECTURE.md** before editing code. It is the single source of truth for the semantics of directories, naming, URLs, data ownership, security and deployment; do not copy its tables into local documents.

- Read the target application's `AGENTS.md` for the _actual_ routes, modules, env requirements and tests.
- **Do not change approved architecture without explicit prior owner consent.** Present the existing rule, proposed change, affected files, migration, risks and checks; await approval for the precise scope before editing. If rules conflict, ask rather than improvise. Make approved structural changes in a separate branch/PR, and never merge or deploy without separate owner approval. See `docs/ARCHITECTURE.md`.
- Place files according to architecture-owned paths, not arbitrary folder names. Next.js components/containers/providers and ORM model files are PascalCase; hooks/stores camelCase; routes lowercase/kebab-case; SQL identifiers snake_case.
- Every Fastify HTTP app has one central `code/routes/index.ts`. A nested route `index.ts` is its URL endpoint, never a nested registry.
- Apps are independent processes; do not import another app's source. Create a shared package only for genuine reusable implementation.
- No Markdown in `code/`. Do not add extra Markdown unless necessary; local agent instructions contain facts, not duplicated global rules.
- Use Zod at external boundaries, Pino structured logs with secrets redacted, and per-app tests and lifecycle.
- Tests are owner-local: `apps/<app>/tests/` (non-web), `apps/web/src/tests/` (Next.js), and root `tests/system/`, `tests/<package>/`, optional `tests/deploy/` (repository-level only). No test sources in production `system/` or `packages/*/`.
- `system/*.ts` is a flat set of maintenance CLIs; `deploy/` tracked infrastructure, `runtime/` untracked certificates/secrets.
- Check affected application tests, typecheck and build, plus `pnpm check:architecture`, `pnpm lint` and `pnpm format:check`; report any unexecuted check.
- Node.js 26 LTS; follow Prettier formatting from the former service template.
- Commit messages: follow the Conventional Commits rules in `docs/ARCHITECTURE.md`; use a concise English imperative summary and run `pnpm check:commit`.
- Do not begin real VPS deployment or external WebSocket verification until a separate agent has reviewed the full repository read-only and the owner has completed manual approval. GitHub Actions local service smoke tests are allowed.
