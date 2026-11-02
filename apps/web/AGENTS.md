# Web — local agent facts

Workspace `@platform/web`: native Next.js App Router, port **3000**. Root ARCHITECTURE.md defines general semantics and naming; only concrete application facts appear here.

Actual features:

- `src/app/page.tsx` is the thin root page; it wraps `HomeContainer` in `DashboardStoreProvider`.
- `src/containers/HomeContainer.tsx` composes the application explorer, search, category filters, service statistics, status and links.
- `src/components/ServiceCard.tsx` is a reusable favorite-able service card; `StatusIndicator.tsx` probes health without fabricating online state; `UpdateBanner.tsx` prompts a manual reload for a newer release.
- `src/providers/DashboardStoreProvider.tsx` creates a separate Zustand store instance per mounted subtree.
- `src/store/dashboardStore.ts` owns filter/favorites/reset and is intentionally in-memory without persistence.
- `src/hooks/useDashboardStore.ts` consumes scoped Zustand state, `useRelease.ts` polls frontend health.
- `src/consts/services.ts` is a fixed demo catalog, _not_ live service discovery; `src/utils/release.ts` compares releases.
- `src/app/health/route.ts` owns `GET /health`, no-store and release metadata.
- Public `/api/*` and `/ws` belong to Fastify behind Caddy. Do not create `src/app/api`.

Start `pnpm dev:web`, test `pnpm --filter @platform/web test`, build `pnpm --filter @platform/web build`. Backend health `/api/health` is available only through the Caddy origin, not directly on :3000. No authentication/login is implemented.
