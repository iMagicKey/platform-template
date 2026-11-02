'use client'

import { useEffect, useState } from 'react'

type CheckState = 'checking' | 'online' | 'offline'

/** Real probe; failure is shown as offline rather than an invented green indicator. */
export function StatusIndicator({ url, label }: { url: string; label: string }) {
    const [status, setStatus] = useState<CheckState>('checking')

    useEffect(() => {
        const controller = new AbortController()
        let active = true
        const check = async () => {
            try {
                const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
                if (active) setStatus(response.ok ? 'online' : 'offline')
            } catch {
                if (active) setStatus('offline')
            }
        }
        void check()
        return () => { active = false; controller.abort() }
    }, [url])

    const color = status === 'online' ? 'bg-emerald-400' : status === 'offline' ? 'bg-rose-400' : 'bg-amber-400'
    return (
        <span aria-live="polite" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <span className={`size-2 rounded-full ${color}`} />
            {label}: {status === 'checking' ? 'Checking' : status === 'online' ? 'Reachable' : 'Unavailable'}
        </span>
    )
}
