'use client'

import { useMemo, useState } from 'react'
import { ServiceCard } from '../components/ServiceCard'
import { AuthPanel } from '../components/AuthPanel'
import { ProjectEstimator } from '../components/ProjectEstimator'
import { StatusIndicator } from '../components/StatusIndicator'
import { SERVICES } from '../consts/services'
import { APP_VERSION } from '../consts/release'
import { useDashboardStore } from '../hooks/useDashboardStore'
import type { ServiceCategory } from '../store/dashboardStore'

const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'all', label: 'All applications' },
    { id: 'http', label: 'HTTP services' },
    { id: 'automation', label: 'Automation' },
]

export function HomeContainer() {
    const filter = useDashboardStore((state) => state.filter)
    const setFilter = useDashboardStore((state) => state.setFilter)
    const favorites = useDashboardStore((state) => state.favorites)
    const reset = useDashboardStore((state) => state.reset)
    const [search, setSearch] = useState('')

    const visible = useMemo(
        () =>
            SERVICES.filter((service) => {
                const matchesCategory = filter === 'all' || service.category === filter
                const query = search.trim().toLowerCase()
                return matchesCategory && (!query || `${service.name} ${service.description} ${service.role}`.toLowerCase().includes(query))
            }),
        [filter, search]
    )

    return (
        <main className="min-h-screen bg-[#0b1220] text-slate-100">
            <header className="border-b border-white/10 bg-[#10192a]">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-xl font-black text-[#0b1220]">
                            P
                        </div>
                        <div>
                            <p className="text-base font-bold tracking-tight">
                                Platform<span className="text-sky-400">Template</span>
                            </p>
                            <p className="text-xs text-slate-400">Application workspace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-400">v{APP_VERSION}</span>
                        <a
                            href="https://github.com/iMagicKey/platform-template"
                            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:border-sky-400 hover:text-sky-300"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub ↗
                        </a>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-9 px-5 py-10 sm:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#172c47] via-[#15223a] to-[#221b3a] p-7 sm:p-10">
                    <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-sky-400/10 blur-3xl" />
                    <div className="relative max-w-3xl space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200">
                            <span className="size-1.5 rounded-full bg-sky-400" /> WORKSPACE OVERVIEW
                        </div>
                        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                            One repository.
                            <br />
                            <span className="text-sky-300">Independent services.</span>
                        </h1>
                        <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                            A practical monorepo with native Next.js, independent Fastify APIs, a scheduler and a Telegram bot. Explore the structure
                            and try the real Zustand-powered interface below.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <StatusIndicator url="/health" label="Frontend" />
                            <StatusIndicator url="/api/health" label="Backend via Caddy" />
                        </div>
                    </div>
                </section>

                <section aria-label="Workspace statistics" className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#131d2d] p-5">
                        <p className="text-sm text-slate-400">Applications in template</p>
                        <p className="mt-3 text-3xl font-semibold tabular-nums">{SERVICES.length}</p>
                        <p className="mt-2 text-xs text-slate-500">Each starts and tests separately</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131d2d] p-5">
                        <p className="text-sm text-slate-400">HTTP applications</p>
                        <p className="mt-3 text-3xl font-semibold tabular-nums">{SERVICES.filter((service) => service.category === 'http').length}</p>
                        <p className="mt-2 text-xs text-slate-500">Native ports and optional Caddy</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131d2d] p-5">
                        <p className="text-sm text-slate-400">Your saved favorites</p>
                        <p className="mt-3 text-3xl font-semibold tabular-nums">{favorites.length}</p>
                        <p className="mt-2 text-xs text-slate-500">Local Zustand state, not persisted</p>
                    </div>
                </section>

                <section aria-labelledby="applications-heading" className="space-y-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">SERVICES</p>
                            <h2 id="applications-heading" className="mt-2 text-2xl font-semibold tracking-tight">
                                Application explorer
                            </h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Filters and favorites use an isolated Zustand store. Service availability is never mocked.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                reset()
                                setSearch('')
                            }}
                            type="button"
                            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-sky-400 hover:text-white"
                        >
                            Reset view
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div role="group" aria-label="Filter applications" className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    aria-pressed={filter === category.id}
                                    onClick={() => setFilter(category.id)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 ${filter === category.id ? 'bg-sky-400 text-slate-950' : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 focus-within:border-sky-400">
                            <span aria-hidden="true" className="text-slate-500">
                                ⌕
                            </span>
                            <span className="sr-only">Search applications</span>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search services…"
                                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                            />
                        </label>
                    </div>
                    {visible.length ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visible.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-slate-400">
                            No matching applications. Try another filter.
                        </div>
                    )}
                </section>

                <section className="grid gap-5 lg:grid-cols-2" aria-label="Working fullstack examples">
                    <AuthPanel />
                    <ProjectEstimator />
                </section>

                <section className="grid gap-5 lg:grid-cols-2" aria-label="Useful endpoints and local development">
                    <div className="rounded-2xl border border-white/10 bg-[#131d2d] p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">ENDPOINTS</p>
                        <h2 className="mt-2 text-xl font-semibold">Explore the running services</h2>
                        <div className="mt-5 space-y-3">
                            {[
                                { path: '/health', note: 'Next.js release and readiness' },
                                { path: '/api/health', note: 'Fastify backend through Caddy' },
                                { path: '/api/docs', note: 'Swagger UI through Caddy' },
                            ].map((endpoint) => (
                                <a
                                    key={endpoint.path}
                                    href={endpoint.path}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-3 transition-colors hover:border-sky-400/40 hover:bg-white/5"
                                >
                                    <div>
                                        <p className="font-mono text-sm text-sky-300">{endpoint.path}</p>
                                        <p className="mt-1 text-xs text-slate-400">{endpoint.note}</p>
                                    </div>
                                    <span aria-hidden="true" className="text-slate-500">
                                        ↗
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131d2d] p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">GET STARTED</p>
                        <h2 className="mt-2 text-xl font-semibold">Run each app separately</h2>
                        <div className="mt-5 rounded-xl border border-white/10 bg-[#0b1220] p-4 font-mono text-sm leading-8 text-slate-300">
                            <p>
                                <span className="text-slate-500">$</span> pnpm dev:web
                            </p>
                            <p>
                                <span className="text-slate-500">$</span> pnpm dev:backend
                            </p>
                            <p>
                                <span className="text-slate-500">$</span> pnpm dev:api
                            </p>
                            <p>
                                <span className="text-slate-500">$</span> pnpm dev:worker
                            </p>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-slate-400">
                            The bot is disabled by default; backend authentication is an explicit integration placeholder. This dashboard does not
                            create accounts or credentials.
                        </p>
                    </div>
                </section>
            </div>
            <footer className="border-t border-white/10 py-7 text-center text-xs text-slate-500">
                Universal Platform Template · An extendable monorepo foundation
            </footer>
        </main>
    )
}
