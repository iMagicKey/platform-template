import { ApiRequestError, requestApi } from './apiClient'

export type Estimate = { hours: number; rateCents: number; totalCents: number }

export async function estimateProjectCost(hours: number, rateCents: number): Promise<Estimate> {
    let data: unknown
    try {
        data = await requestApi<unknown>('/api/projects/estimate', {
            method: 'POST',
            body: JSON.stringify({ hours, rateCents }),
        })
    } catch (cause) {
        if (cause instanceof ApiRequestError && cause.status === 400) throw new Error('Check the entered numbers')
        throw cause
    }
    if (
        !data ||
        typeof data !== 'object' ||
        !('hours' in data) ||
        !('rateCents' in data) ||
        !('totalCents' in data) ||
        typeof data.hours !== 'number' ||
        typeof data.rateCents !== 'number' ||
        typeof data.totalCents !== 'number'
    ) {
        throw new Error('Invalid estimate response')
    }
    return { hours: data.hours, rateCents: data.rateCents, totalCents: data.totalCents }
}
