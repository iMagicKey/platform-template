import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

const origin = process.env.SMOKE_ORIGIN ?? 'http://127.0.0.1:8080'
const apiOrigin = process.env.SMOKE_API_ORIGIN ?? 'http://127.0.0.1:8081'

async function waitFor(url: string, attempts = 40) {
    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(2000), cache: 'no-store' })
            if (response.ok) return response
        } catch {
            // Services may still be starting.
        }
        await delay(250)
    }
    throw new Error(`Service did not become ready: ${url}`)
}

async function main() {
    const web = await waitFor(`${origin}/health`)
    assert.equal((await web.json()).service, 'web')

    const backend = await waitFor(`${origin}/api/health`)
    assert.equal((await backend.json()).service, 'backend')

    const projects = await waitFor(`${origin}/api/projects`)
    assert.ok(Array.isArray((await projects.json()).projects))

    const estimate = await fetch(`${origin}/api/projects/estimate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 3, rateCents: 1250 }),
        signal: AbortSignal.timeout(2000),
    })
    assert.equal(estimate.status, 200)
    assert.equal((await estimate.json()).totalCents, 3750)

    const api = await waitFor(`${apiOrigin}/v1/ping`)
    assert.equal((await api.json()).message, 'pong')

    const docs = await waitFor(`${apiOrigin}/openapi.json`)
    assert.ok((await docs.json()).paths['/v1/ping'])

    const forbidden = await fetch(`${origin}/api/auth/me`, { signal: AbortSignal.timeout(2000) })
    assert.equal(forbidden.status, 501)
    process.stdout.write('Caddy integration smoke passed: web, backend, projects, API, OpenAPI and default auth boundary.\n')
}

await main()
