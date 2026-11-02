'use client'

import { useContext } from 'react'
import { useStore } from 'zustand'
import { DashboardStoreContext } from '../providers/DashboardStoreProvider'
import type { DashboardState } from '../store/dashboardStore'

export function useDashboardStore<T>(selector: (state: DashboardState) => T): T {
    const store = useContext(DashboardStoreContext)
    if (!store) throw new Error('useDashboardStore requires DashboardStoreProvider')
    return useStore(store, selector)
}
