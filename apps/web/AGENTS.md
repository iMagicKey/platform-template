# Web — local agent facts

Workspace `@platform/web`: native Next.js App Router, port **3000**. Production uses supported `next start`, with no standalone output mode. Root `docs/ARCHITECTURE.md` defines general semantics and naming; only concrete application facts appear here.

Actual features:

- `src/app/page.tsx` is the thin root page; it wraps `HomeContainer` in `DashboardStoreProvider`.
- `src/containers/HomeContainer.tsx` composes the blue-and-white iMagic Platform Showcase (concept A): responsive hero, searchable service explorer, working demos, architecture features and quick start. It owns search/filter composition, not reusable visual primitives.
- `src/components/PlatformHeader.tsx`, `PlatformHero.tsx`, `SectionHeading.tsx`, `FeatureTile.tsx`, `CapabilityCard.tsx`, `QuickStartBanner.tsx`, and `PlatformIcon.tsx` are reusable presentation components. `src/app/globals.css` owns shared light-blue design tokens and UI primitives; avoid page-level logic there.
- `src/components/ServiceCard.tsx` is a reusable favorite-able service card; `StatusIndicator.tsx` probes health without fabricating online state; `UpdateBanner.tsx` prompts a manual reload for a newer release.
- `src/providers/DashboardStoreProvider.tsx` creates a separate Zustand store instance per mounted subtree.
- `src/store/dashboardStore.ts` owns filter/favorites/reset and is intentionally in-memory without persistence.
- `src/hooks/useDashboardStore.ts` consumes scoped Zustand state, `useRelease.ts` polls frontend health.
- `src/consts/services.ts` is a fixed demo catalog, _not_ live service discovery; `src/utils/release.ts` compares releases.
- `src/components/AuthPanel.tsx` with `hooks/useAuth.ts` and `libs/authClient.ts` implements the optional cookie-session demo; `ProjectEstimator.tsx` and `libs/projectsClient.ts` demonstrate the actual Zod project estimate POST.
- `src/app/health/route.ts` owns `GET /health`, no-store and release metadata.
- Public `/api/*` and `/ws` belong to Fastify behind Caddy. Do not create `src/app/api`.

Start `pnpm dev:web`, test `pnpm --filter @platform/web test`, build `pnpm --filter @platform/web build`. Backend health `/api/health` is available only through the Caddy origin, not directly on :3000. Development-only optional auth is implemented behind Caddy; real production identity is not.

- `src/libs/apiClient.ts` validates `@platform/api-contract` JSON envelopes and surfaces typed API errors. `authClient.ts` and `projectsClient.ts` consume its data payloads; `/health` remains a separate raw infrastructure check.
