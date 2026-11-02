/**
 * Shared, process-local operational state.
 *
 * Module owners write their own fields; any module may read them.
 * The default singleton is for the running process. Each buildApp() call
 * gets its own store unless the caller explicitly supplies one.
 */
export type RuntimeStore = {
    /** Number of currently connected WebSocket clients in this app instance. */
    activeConnections: number
    /** Unix time in milliseconds of the most recent successful estimate. */
    lastProjectEstimateAt: number | null
}

export function createStore(): RuntimeStore {
    return {
        activeConnections: 0,
        lastProjectEstimateAt: null,
    }
}

const store = createStore()

export default store
