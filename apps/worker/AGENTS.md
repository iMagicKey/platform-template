# Worker — local agent facts

Workspace: `@platform/worker`, no HTTP port, independent process. Uses npm `imagic-scheduler@^1.0.1` directly, never a local copy.

`code/tasks/example.ts` logs a periodic harmless example and can be disabled with `SCHEDULER_ENABLED=false`. `code/index.ts` handles SIGINT/SIGTERM, stops new tasks and briefly drains active work under a 10-second shutdown deadline that remains armed after the drain. `tests/index.test.ts` exercises clean exit and lingering handles through the real entry point.

A scheduler task runs in _one designated instance_ only. The npm library marks a timed-out task as not in process while its underlying promise continues. Make tasks idempotent and never deploy multiple worker replicas for the same job without a future distributed lock.

Tests are in the app-local `apps/worker/tests/`; the app has no route registry because it is not an HTTP service.

The npm scheduler ships JavaScript without TypeScript declarations. The app-local ambient types are in `code/types/imagic-scheduler.d.ts`; keep them included in both `tsconfig.json` and `tsconfig.test.json` when changing the worker's TypeScript project boundaries.
