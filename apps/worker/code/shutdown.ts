import { setTimeout as delay } from 'node:timers/promises'

/** Allow active tasks to settle, but never wait indefinitely for an unresolved promise. */
export async function waitForTaskDrain(hasActiveTask: () => boolean, maxWaitMs = 5_000): Promise<boolean> {
    const deadline = Date.now() + maxWaitMs
    while (hasActiveTask()) {
        const remaining = deadline - Date.now()
        if (remaining <= 0) return false
        await delay(Math.min(100, remaining))
    }
    return true
}
