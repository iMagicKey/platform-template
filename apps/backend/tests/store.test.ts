import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../code/app.js'
import { readConfig } from '../code/config.js'
import { markProjectEstimated } from '../code/modules/projects/projects.service.js'
import store, { createStore } from '../code/store.js'

test('the runtime store supports direct assignment and an owner-owned update function', () => {
    const first = createStore()
    const second = createStore()

    // Example: the WebSocket module owns direct updates to its connection count.
    first.activeConnections = 2
    assert.equal(first.activeConnections, 2)
    assert.equal(second.activeConnections, 0)

    // Example: project metrics are changed through a function in the owning module.
    markProjectEstimated(first, 1_700_000_000_000)
    assert.equal(first.lastProjectEstimateAt, 1_700_000_000_000)
    assert.equal(second.lastProjectEstimateAt, null)

    // A fresh test store must not modify the production process singleton.
    assert.equal(store.activeConnections, 0)
    assert.equal(store.lastProjectEstimateAt, null)
})

test('Fastify instances created in one process never share runtime state by default', async () => {
    const config = readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' })
    const firstState = createStore()
    const secondState = createStore()
    const first = await buildApp(config, firstState)
    const second = await buildApp(config, secondState)

    try {
        const result = await first.inject({
            method: 'POST',
            url: '/projects/estimate',
            payload: { hours: 2, rateCents: 1500 },
        })
        assert.equal(result.statusCode, 200)
        assert.ok(firstState.lastProjectEstimateAt !== null)
        assert.equal(secondState.lastProjectEstimateAt, null)
        assert.equal(firstState.activeConnections, 0)
        assert.equal(secondState.activeConnections, 0)

        const invalid = await second.inject({
            method: 'POST',
            url: '/projects/estimate',
            payload: { hours: -1, rateCents: 1500 },
        })
        assert.equal(invalid.statusCode, 400)
        assert.equal(secondState.lastProjectEstimateAt, null)
    } finally {
        await Promise.all([first.close(), second.close()])
    }
})
