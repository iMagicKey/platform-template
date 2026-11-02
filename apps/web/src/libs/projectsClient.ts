export type Estimate = { hours: number; rateCents: number; totalCents: number }

export async function estimateProjectCost(hours: number, rateCents: number): Promise<Estimate> {
    const response = await fetch('/api/projects/estimate', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, rateCents }),
    })
    if (!response.ok) throw new Error(response.status === 400 ? 'Check the entered numbers' : 'Backend unavailable or returned an error')
    const body = await response.json() as unknown
    if (!body || typeof body !== 'object' || !('totalCents' in body) || typeof body.totalCents !== 'number') {
        throw new Error('Invalid response format')
    }
    return { hours, rateCents, totalCents: body.totalCents }
}
