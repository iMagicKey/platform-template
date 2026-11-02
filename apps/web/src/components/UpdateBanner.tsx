'use client'

import { useRelease } from '../hooks/useRelease'

export function UpdateBanner({ release }: { release: string }) {
    const available = useRelease(release)
    if (!available) return null
    return (
        <aside
            role="status"
            aria-live="polite"
            className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-xl border border-[#b2d7ff] bg-white p-4 text-sm text-[#174274] shadow-[0_18px_55px_rgba(19,78,161,0.22)]"
        >
            <span>A new version of this app is available.</span>
            <button type="button" className="action-primary px-4 py-2" onClick={() => window.location.reload()}>
                Refresh
            </button>
        </aside>
    )
}
