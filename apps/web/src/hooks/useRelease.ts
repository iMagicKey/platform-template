'use client'

import { useEffect, useState } from 'react'
import { hasNewRelease } from '../utils/release'

type Health = { status: string; release: string }

export function useRelease(current: string): boolean {
    const [available, setAvailable] = useState(false)
    useEffect(() => {
        let cancelled = false
        const check = async () => {
            try {
                const response = await fetch('/health', { cache: 'no-store' })
                if (!response.ok) return
                const health = (await response.json()) as Health
                if (!cancelled && hasNewRelease(current, health.release)) setAvailable(true)
            } catch {
                // Network errors are not a new release; retry on next poll.
            }
        }
        void check()
        const interval = setInterval(() => {
            void check()
        }, 60_000)
        return () => {
            cancelled = true
            clearInterval(interval)
        }
    }, [current])
    return available
}
