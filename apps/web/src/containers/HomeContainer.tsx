'use client'

import { useMemo, useState } from 'react'
import { AuthPanel } from '../components/AuthPanel'
import { CapabilityCard } from '../components/CapabilityCard'
import { FeatureTile } from '../components/FeatureTile'
import { PlatformHeader } from '../components/PlatformHeader'
import { PlatformHero } from '../components/PlatformHero'
import { PlatformIcon } from '../components/PlatformIcon'
import { ProjectEstimator } from '../components/ProjectEstimator'
import { QuickStartBanner } from '../components/QuickStartBanner'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
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

const capabilities = [
    { title: 'Authentication', description: 'Session login & current-user flow', icon: 'user' as const, href: '#auth-demo' },
    { title: 'Project estimator', description: 'Real Fastify + Zod request', icon: 'calculator' as const, href: '#project-estimator' },
    { title: 'Service health', description: 'Live HTTP readiness probes', icon: 'activity' as const, href: '#service-health' },
    { title: 'API documentation', description: 'Swagger / OpenAPI reference', icon: 'file-code' as const, href: '/api/docs' },
]

const features = [
    { title: 'Runtime Store', description: 'Typed, isolated process state', icon: 'layers' as const },
    { title: 'Zod validation', description: 'Schemas for input and output', icon: 'shield' as const },
    { title: 'OpenAPI', description: 'Generated API contracts', icon: 'file-code' as const },
    { title: 'Caddy ingress', description: 'One origin for web and API', icon: 'cloud' as const },
    { title: 'File adapter', description: 'Local JSON storage example', icon: 'database' as const },
    { title: 'Independent apps', description: 'Separate builds and lifecycles', icon: 'boxes' as const },
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
        <div className="min-h-screen bg-[#f7faff]">
            <PlatformHeader />
            <main className="mx-auto max-w-7xl space-y-18 px-5 pt-7 pb-18 sm:px-8 sm:pt-9 lg:space-y-22">
                <PlatformHero />

                <section id="services" aria-labelledby="services-heading" className="scroll-mt-28">
                    <SectionHeading
                        id="services-heading"
                        eyebrow="THE PLATFORM"
                        title="Everything you need to get started"
                        description="Five independent applications with clear responsibilities, predictable conventions and room to grow."
                        centered
                    />

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1ecfa] bg-white/75 p-3.5 sm:px-5">
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter applications">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    aria-pressed={filter === category.id}
                                    onClick={() => setFilter(category.id)}
                                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                                        filter === category.id
                                            ? 'bg-[#e6f2ff] text-[#0961c9] shadow-[inset_0_0_0_1px_#cce5ff]'
                                            : 'text-[#657e9c] hover:bg-[#f1f7ff] hover:text-[#164b8b]'
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-2 rounded-lg border border-[#e0eaf6] bg-white px-3 py-2 focus-within:border-[#338be9]">
                                <PlatformIcon name="search" size={16} className="text-[#9aacc4]" />
                                <span className="sr-only">Search applications</span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search services"
                                    className="w-33 bg-transparent text-xs text-[#23436c] outline-none placeholder:text-[#99acc1] sm:w-44"
                                />
                            </label>
                            <button
                                type="button"
                                aria-label="Reset service filters and favorites"
                                title="Reset view"
                                onClick={() => {
                                    reset()
                                    setSearch('')
                                }}
                                className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e0eaf6] bg-white text-[#6683a8] transition-colors hover:bg-[#eaf4ff] hover:text-[#0966d8]"
                            >
                                <PlatformIcon name="reset" size={17} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap justify-between gap-2 px-1 text-xs text-[#7a8da7]" aria-live="polite">
                        <span>
                            Showing {visible.length} of {SERVICES.length} applications
                        </span>
                        <span>
                            {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'} · Stored in scoped Zustand state
                        </span>
                    </div>
                    {visible.length ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visible.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                            {filter === 'all' && !search.trim() && (
                                <a
                                    href="https://github.com/iMagicKey/platform-template/blob/main/docs/ARCHITECTURE.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex min-h-55 flex-col items-start rounded-2xl border border-dashed border-[#b8d6f7] bg-[#eaf4ff]/55 p-6 transition-colors hover:bg-[#deefff]"
                                >
                                    <span className="flex size-12 items-center justify-center rounded-xl bg-white text-[#1973d3]">
                                        <PlatformIcon name="shield" size={24} />
                                    </span>
                                    <span className="mt-4 font-bold text-[#17355f]">Shared standards</span>
                                    <span className="mt-2 text-sm leading-6 text-[#7085a0]">
                                        Architecture, naming rules and clear conventions for every service.
                                    </span>
                                    <span className="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold text-[#116ad3]">
                                        Read architecture <PlatformIcon name="arrow-up-right" size={14} />
                                    </span>
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="surface-card p-10 text-center">
                            <PlatformIcon name="search" size={27} className="mx-auto text-[#7eaddb]" />
                            <p className="mt-3 font-semibold text-[#284c7a]">No matching applications</p>
                            <p className="mt-1 text-sm text-[#7a8da7]">Try another search or category.</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setFilter('all')
                                    setSearch('')
                                }}
                                className="mt-4 text-sm font-semibold text-[#116cdb] hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </section>

                <section id="demo" aria-labelledby="demo-heading" className="scroll-mt-28">
                    <SectionHeading
                        id="demo-heading"
                        eyebrow="LIVE CAPABILITIES"
                        title="Explore the platform in action"
                        description="Real interactions with the template's backend. Demo authentication is optional; nothing is presented as online without a check."
                        centered
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {capabilities.map((capability) => (
                            <CapabilityCard key={capability.title} {...capability} />
                        ))}
                    </div>

                    <div id="service-health" className="surface-card mt-6 flex scroll-mt-28 flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf6ff] text-[#1473dd]">
                                <PlatformIcon name="activity" size={22} />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-[#1d395e]">Live service checks</h3>
                                <p className="mt-0.5 text-xs text-[#8192a9]">Probes run from your browser. Backend requires Caddy on :8080.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <StatusIndicator url="/health" label="Web" />
                            <StatusIndicator url="/api/health" label="Backend" />
                        </div>
                    </div>

                    <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-2">
                        <div id="auth-demo" className="scroll-mt-28">
                            <AuthPanel />
                        </div>
                        <div id="project-estimator" className="scroll-mt-28">
                            <ProjectEstimator />
                        </div>
                    </div>
                </section>

                <section id="architecture" aria-labelledby="architecture-heading" className="scroll-mt-28">
                    <SectionHeading
                        id="architecture-heading"
                        eyebrow="ARCHITECTURE"
                        title="Thoughtful foundations, ready to extend"
                        description="Clear boundaries, useful examples and established tools — without an unnecessary framework on top."
                        centered
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <FeatureTile key={feature.title} {...feature} />
                        ))}
                    </div>
                </section>

                <QuickStartBanner />
            </main>
            <footer className="border-t border-[#e0eaf8] bg-white/80">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-[#7488a6] sm:px-8">
                    <span>© iMagic · Platform Template · v{APP_VERSION}</span>
                    <div className="flex flex-wrap items-center gap-5">
                        <a href="#overview" className="hover:text-[#0866df]">
                            Back to top
                        </a>
                        <a
                            href="https://github.com/iMagicKey/platform-template"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-[#0866df]"
                        >
                            <PlatformIcon name="github" size={14} /> GitHub
                        </a>
                        <a
                            href="https://github.com/iMagicKey/platform-template/blob/main/docs/ARCHITECTURE.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#0866df]"
                        >
                            Architecture
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
