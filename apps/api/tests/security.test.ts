import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../code/app.js'
import { readConfig } from '../code/config.js'

test('production API hides OpenAPI and Swagger until explicitly enabled', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'production', DOCS_ENABLED: 'auto' }))
    try {
        assert.equal((await app.inject('/health')).statusCode, 200)
        assert.equal((await app.inject('/docs')).statusCode, 404)
        assert.equal((await app.inject('/openapi.json')).statusCode, 404)
    } finally {
        await app.close()
    }
})
