'use client'

import { createContext, useRef, type ReactNode } from 'react'
import { createDashboardStore, type DashboardStore } from '../store/dashboardStore'

export const DashboardStoreContext = createContext<DashboardStore | null>(null)

/** New store per mounted subtree. Never share a mutable Zustand singleton across SSR requests. */
export function DashboardStoreProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<DashboardStore | null>(null)
    if (storeRef.current === null) storeRef.current = createDashboardStore()
    return <DashboardStoreContext.Provider value={storeRef.current}>{children}</DashboardStoreContext.Provider>
}
