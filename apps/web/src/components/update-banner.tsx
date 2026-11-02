'use client'

import { useRelease } from '../hooks/use-release'

export function UpdateBanner({ release }: { release: string }) {
    const available = useRelease(release)
    if (!available) return null
    return (
        <aside role="status" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-sky-300 bg-slate-950 p-4 text-white shadow-2xl">
            <span>Доступна новая версия приложения.</span>
            <button className="rounded-md bg-sky-300 px-4 py-2 font-medium text-slate-950 hover:bg-sky-200" onClick={() => window.location.reload()}>
                Обновить
            </button>
        </aside>
    )
}
