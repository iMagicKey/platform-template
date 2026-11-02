'use client'

import type { ServiceDefinition } from '../consts/services'
import { useDashboardStore } from '../hooks/useDashboardStore'
import { PlatformIcon, type PlatformIconName } from './PlatformIcon'

const icons: Record<string, PlatformIconName> = {
    web: 'monitor',
    backend: 'server',
    api: 'code',
    worker: 'layers',
    bot: 'bot',
}

const accents: Record<string, string> = {
    sky: 'bg-[#e7f3ff] text-[#0975de]',
    violet: 'bg-[#eef0ff] text-[#6967d8]',
    emerald: 'bg-[#e6f8f3] text-[#168d72]',
    amber: 'bg-[#fff4e3] text-[#c88d2c]',
    pink: 'bg-[#ffebf4] text-[#d35c91]',
}

export function ServiceCard({ service }: { service: ServiceDefinition }) {
    const isFavorite = useDashboardStore((state) => state.favorites.includes(service.id))
    const toggleFavorite = useDashboardStore((state) => state.toggleFavorite)

    return (
        <article className="surface-card group flex min-h-55 flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b5d6ff] hover:shadow-[0_16px_34px_-20px_rgba(27,94,176,0.35)]">
            <div className="flex items-start justify-between gap-3">
                <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accents[service.accent] ?? 'bg-[#edf5ff] text-[#0d6de0]'}`}
                >
                    <PlatformIcon name={icons[service.id] ?? 'boxes'} size={25} />
                </div>
                <button
                    type="button"
                    aria-label={isFavorite ? `Remove ${service.name} from favorites` : `Add ${service.name} to favorites`}
                    aria-pressed={isFavorite}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => toggleFavorite(service.id)}
                    className={`flex size-9 items-center justify-center rounded-lg border transition-colors ${
                        isFavorite
                            ? 'border-[#f4dba5] bg-[#fff8e9] text-[#e19a22]'
                            : 'border-[#edf2f9] bg-[#f9fbff] text-[#a6b7cd] hover:border-[#c5dffc] hover:text-[#217ee5]'
                    }`}
                >
                    <PlatformIcon name="star" size={18} className={isFavorite ? 'fill-current' : ''} />
                </button>
            </div>
            <div className="mt-4 flex-1">
                <h3 className="text-[16px] font-bold tracking-tight text-[#15315c]">{service.name}</h3>
                <p className="mt-1 text-[11px] font-semibold tracking-wide text-[#4280cb]">{service.role}</p>
                <p className="mt-3 text-sm leading-6 text-[#71839e]">{service.description}</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2f9] pt-3.5">
                <span className="rounded-md bg-[#f0f6ff] px-2.5 py-1 text-[11px] font-medium text-[#426e9d]">{service.technology}</span>
                <span className="font-mono text-[11px] text-[#92a3b9]">{service.port === '—' ? 'No HTTP port' : `:${service.port}`}</span>
            </div>
        </article>
    )
}
