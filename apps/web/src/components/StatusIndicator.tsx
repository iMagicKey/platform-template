'use client'

import { useEffect, useState } from 'react'

type CheckState = 'checking' | 'online' | 'offline'

/** Real probe; failures are shown as unavailable, never as invented green status. */
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
        return () => {
            active = false
            controller.abort()
        }
    }, [url])

    const color = status === 'online' ? 'bg-[#16ba82]' : status === 'offline' ? 'bg-[#ed6277]' : 'bg-[#f3b84f]'
    return (
        <span aria-live="polite" className="inline-flex items-center gap-2 rounded-full border border-[#e0ebf7] bg-[#f9fbff] px-3 py-2 text-xs font-medium text-[#536b8d]">
            <span className={`size-2 rounded-full ${color}`} />
            {label}: {status === 'checking' ? 'Checking' : status === 'online' ? 'Reachable' : 'Unavailable'}
        </span>
    )
}
