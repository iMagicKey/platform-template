'use client'

import type { ServiceDefinition } from '../consts/services'
import { useDashboardStore } from '../hooks/useDashboardStore'

const accentColors: Record<string, string> = {
    sky: 'bg-sky-400',
    violet: 'bg-violet-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    pink: 'bg-pink-400',
}

export function ServiceCard({ service }: { service: ServiceDefinition }) {
    const isFavorite = useDashboardStore((state) => state.favorites.includes(service.id))
    const toggleFavorite = useDashboardStore((state) => state.toggleFavorite)

    return (
        <article className="group flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[#131d2d] p-5 transition-colors hover:border-white/25 hover:bg-[#192537]">
            <div>
                <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                            <span aria-hidden="true" className={`size-3 rounded-full ${accentColors[service.accent] ?? 'bg-white'}`} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">{service.name}</h3>
                            <p className="text-xs text-slate-400">{service.role}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label={isFavorite ? `Remove ${service.name} from favorites` : `Add ${service.name} to favorites`}
                        aria-pressed={isFavorite}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        onClick={() => toggleFavorite(service.id)}
                        className={`rounded-lg border px-2.5 py-1.5 text-lg transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 ${isFavorite ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        {isFavorite ? '★' : '☆'}
                    </button>
                </div>
                <p className="min-h-12 text-sm leading-relaxed text-slate-300">{service.description}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs">
                <span className="rounded-md bg-white/5 px-2.5 py-1.5 font-medium text-slate-300">{service.technology}</span>
                <span className="font-mono text-slate-400">{service.port === '—' ? 'No port' : `:${service.port}`}</span>
            </div>
        </article>
    )
}
