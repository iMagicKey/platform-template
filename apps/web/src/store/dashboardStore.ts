import { createStore } from 'zustand/vanilla'

export type ServiceCategory = 'all' | 'http' | 'automation'

export type DashboardState = {
    filter: ServiceCategory
    favorites: string[]
    setFilter: (category: ServiceCategory) => void
    toggleFavorite: (serviceId: string) => void
    reset: () => void
}

export function createDashboardStore() {
    return createStore<DashboardState>()((set) => ({
        filter: 'all',
        favorites: ['web'],
        setFilter: (filter) => set({ filter }),
        toggleFavorite: (serviceId) =>
            set((state) => ({
                favorites: state.favorites.includes(serviceId) ? state.favorites.filter((id) => id !== serviceId) : [...state.favorites, serviceId],
            })),
        reset: () => set({ filter: 'all', favorites: ['web'] }),
    }))
}

export type DashboardStore = ReturnType<typeof createDashboardStore>
