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

function object(value: unknown): Record<string, unknown> {
    assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value))
    return value as Record<string, unknown>
}

async function main() {
    const web = await waitFor(`${origin}/health`)
    assert.equal(object(await web.json()).service, 'web')

    const backend = await waitFor(`${origin}/api/health`)
    assert.equal(object(await backend.json()).service, 'backend')

    const projects = await waitFor(`${origin}/api/projects`)
    assert.ok(Array.isArray(object(object(await projects.json()).data).projects))

    const estimate = await fetch(`${origin}/api/projects/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 3, rateCents: 1250 }),
        signal: AbortSignal.timeout(2000),
    })
    assert.equal(estimate.status, 200)
    assert.equal(object(object(await estimate.json()).data).totalCents, 3750)

    const backendSpec = object(await (await waitFor(`${origin}/api/openapi.json`)).json())
    const backendServers = backendSpec.servers as Array<{ url: string }>
    assert.equal(backendServers[0]?.url, '/api')
    assert.ok(object(backendSpec.paths)['/auth/login'])
    const swaggerPage = await waitFor(`${origin}/api/docs/`)
    const swaggerHtml = await swaggerPage.text()
    assert.match(swaggerHtml, /\.\/static\/swagger-ui\.css/)
    const swaggerStyles = await waitFor(`${origin}/api/docs/static/swagger-ui.css`)
    assert.match(swaggerStyles.headers.get('content-type') ?? '', /text\/css/)
    const swaggerScript = await waitFor(`${origin}/api/docs/static/swagger-ui-bundle.js`)
    assert.match(swaggerScript.headers.get('content-type') ?? '', /javascript/)
    const swaggerInitializer = await waitFor(`${origin}/api/docs/static/swagger-initializer.js`)
    assert.match(swaggerInitializer.headers.get('content-type') ?? '', /javascript/)

    const api = await waitFor(`${apiOrigin}/v1/ping`)
    assert.equal(object(object(await api.json()).data).message, 'pong')

    const docs = await waitFor(`${apiOrigin}/openapi.json`)
    assert.ok(object(object(await docs.json()).paths)['/v1/ping'])

    const forbidden = await fetch(`${origin}/api/auth/me`, { signal: AbortSignal.timeout(2000) })
    assert.ok([401, 501].includes(forbidden.status))
    const forbiddenBody = object(await forbidden.json())
    assert.equal(forbiddenBody.data, null)
    assert.equal(object(forbiddenBody.error).code, 'AUTH_NOT_CONFIGURED')
    process.stdout.write('Caddy integration smoke passed: web, backend, projects, API, OpenAPI and default auth boundary.\n')
}

await main()
