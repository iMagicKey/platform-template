import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../../apps/backend/code/app.js'
import { readConfig } from '../../apps/backend/code/config.js'

test('backend exposes one unprefixed health route and no-store metadata', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const response = await app.inject('/health')
        assert.equal(response.statusCode, 200)
        assert.equal(response.headers['cache-control'], 'no-store')
        assert.equal(response.json().service, 'backend')
        assert.equal((await app.inject('/api/health')).statusCode, 404)
    } finally {
        await app.close()
    }
})

test('demo login cannot authenticate without an identity provider', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const response = await app.inject({ method: 'POST', url: '/auth/login', payload: { login: 'example', password: 'invalid' } })
        assert.equal(response.statusCode, 501)
        assert.equal(response.json().data, null)
        assert.equal(response.json().error.code, 'AUTH_NOT_CONFIGURED')
        assert.equal((await app.inject('/auth')).statusCode, 200)
    } finally {
        await app.close()
    }
})

test('WebSocket requires explicit authentication', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const response = await app.inject({
            url: '/ws',
            headers: { origin: 'https://untrusted.example', upgrade: 'websocket', connection: 'Upgrade' },
        })
        assert.notEqual(response.statusCode, 200)
    } finally {
        await app.close()
    }
})
