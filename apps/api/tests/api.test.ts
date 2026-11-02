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
        assert.equal((await app.inject('/v1/ping')).json().message, 'pong')
        assert.equal((await app.inject('/auth')).statusCode, 404)
    } finally { await app.close() }
})
test('public OpenAPI describes v1 routes', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const response = await app.inject('/openapi.json')
        assert.equal(response.statusCode, 200)
        assert.ok(response.json().paths['/v1/ping'])
    } finally { await app.close() }
})
