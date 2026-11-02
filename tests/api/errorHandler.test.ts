import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../../apps/api/code/app.js'
import { readConfig } from '../../apps/api/code/config.js'

test('public API distinguishes raw health and enveloped JSON routes', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const health = (await app.inject('/health')).json()
        assert.equal(health.service, 'api')
        assert.equal('data' in health, false)

        const ping = (await app.inject('/v1/ping')).json()
        assert.deepEqual(ping, { data: { message: 'pong' }, error: null })

        const missing = await app.inject('/v1/missing')
        assert.equal(missing.statusCode, 404)
        assert.deepEqual(missing.json(), { data: null, error: { code: 'NOT_FOUND', message: 'Route not found' } })
    } finally {
        await app.close()
    }
})

test('unexpected exceptions are sanitized in independent API', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    app.get('/__test/error', async () => {
        throw new Error('private-secret')
    })
    try {
        const response = await app.inject('/__test/error')
        assert.equal(response.statusCode, 500)
        assert.equal(response.json().data, null)
        assert.equal(response.json().error.code, 'INTERNAL_SERVER_ERROR')
        assert.doesNotMatch(response.body, /private-secret/)
    } finally {
        await app.close()
    }
})
