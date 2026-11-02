# Agent instructions — platform-template

Read **ARCHITECTURE.md** before changing application boundaries, routing or deployment. It is the normative contract; this file is only a short execution guide.

- Apps are independent processes; never import source files from another app. Use explicit HTTP/WebSocket contracts.
- Backend code goes in `apps/<service>/code`, not `src`. Next.js code goes in `apps/web/src`.
- Every Fastify app has exactly one registry `code/routes/index.ts`. Nested `routes/<segment>/index.ts` is an endpoint, not a registry.
- Each app has its own `package.json`, tests, env schema, logs and local `AGENTS.md` with *facts*, not duplicated standards.
- Do not place Markdown inside `code/`. Avoid adding new Markdown unless essential. Do not invent shared workspace packages.
- Validate user input with Zod; use Pino; no credentials, cookies or tokens in logs.
- `system/` is CLI utilities; `deploy/` is versioned infrastructure; `runtime/` is untracked secrets and certificates.
- Required before claiming success: `pnpm check:architecture`, affected app typecheck/tests and build. Report checks that could not run.
- Node.js 26 LTS; prefer Node built-ins and pinned-compatible stable dependencies.
