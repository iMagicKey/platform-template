# Web — local agent facts

Workspace: `@platform/web`, native Next.js App Router, internal port 3000. Public owner: `/`, `/health`; **NOT `/api/*` or `/ws`** when Fastify backend is present.

Real paths: `GET /` and `GET /health`. `/health` is no-store and includes the build release. Client release hook shows a manual refresh notice when a new build is deployed.

Source conventions: `src/app` routes, `components` reusable UI, `containers` screen composition, `hooks` client hooks, `libs` integration adapters, `providers` React contexts, `store` client state, `utils` pure utilities, `consts` fixed values. Directory presence is not a reason to create empty files.

Do not put server credentials in `NEXT_PUBLIC_*`; Next config remains in app root. Read root `ARCHITECTURE.md`. Tests: `pnpm --filter @platform/web test`.
