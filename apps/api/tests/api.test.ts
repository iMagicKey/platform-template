import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../code/app.js'
import { readConfig } from '../code/config.js'

test('independent API returns its own health and v1 ping', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const health = await app.inject('/health')
        assert.equal(health.statusCode, 200)
        assert.equal(health.json().service, 'api')
        assert.deepEqual((await app.inject('/v1/ping')).json(), { data: { message: 'pong' }, error: null })
        const missing = await app.inject('/auth')
        assert.equal(missing.statusCode, 404)
        assert.equal(missing.json().data, null)
        assert.equal(missing.json().error.code, 'NOT_FOUND')
    } finally {
        await app.close()
    }
})
test('public OpenAPI describes v1 routes when explicitly enabled', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'true' }))
    try {
        const response = await app.inject('/openapi.json')
        assert.equal(response.statusCode, 200)
        assert.ok(response.json().paths['/v1/ping'])
    } finally {
        await app.close()
    }
})
