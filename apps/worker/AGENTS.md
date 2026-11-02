# Worker — local agent facts

Workspace: `@platform/worker`, no HTTP port, independent process. Uses npm `imagic-scheduler@^1.0.1` directly, never a local copy.

`code/tasks/example.ts` logs a periodic harmless example and can be disabled with `SCHEDULER_ENABLED=false`. `code/index.ts` handles SIGINT/SIGTERM, stops new tasks and briefly drains active work under a bounded shutdown deadline.

A scheduler task runs in _one designated instance_ only. The npm library marks a timed-out task as not in process while its underlying promise continues. Make tasks idempotent and never deploy multiple worker replicas for the same job without a future distributed lock.

Tests are in `tests/`; the app has no route registry because it is not an HTTP service.
