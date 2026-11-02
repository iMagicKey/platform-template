# Agent instructions — platform-template

Read **ARCHITECTURE.md** before editing code. It is the single source of truth for the semantics of directories, naming, URLs, data ownership, security and deployment; do not copy its tables into local documents.

- Read the target application's `AGENTS.md` for the *actual* routes, modules, env requirements and tests.
- Place files according to architecture-owned paths, not arbitrary folder names. Next.js components/containers/providers and ORM model files are PascalCase; hooks/stores camelCase; routes lowercase/kebab-case; SQL identifiers snake_case.
- Every Fastify HTTP app has one central `code/routes/index.ts`. A nested route `index.ts` is its URL endpoint, never a nested registry.
- Apps are independent processes; do not import another app's source. Create a shared package only for genuine reusable implementation.
- No Markdown in `code/`. Do not add extra Markdown unless necessary; local agent instructions contain facts, not duplicated global rules.
- Use Zod at external boundaries, Pino structured logs with secrets redacted, and per-app tests and lifecycle.
- `system/*.ts` is a flat set of maintenance CLIs; `deploy/` tracked infrastructure, `runtime/` untracked certificates/secrets.
- Check affected application tests, typecheck and build, plus `pnpm check:architecture`, `pnpm lint` and `pnpm format:check`; report any unexecuted check.
- Node.js 26 LTS; follow Prettier formatting from the former service template.
