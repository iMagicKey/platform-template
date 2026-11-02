import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../code/app.js'
import { readConfig } from '../code/config.js'

test('validation returns multiple structured issues and preserves the HTTP status', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const response = await app.inject({
            method: 'POST',
            url: '/projects/estimate',
            payload: { hours: -2, rateCents: 0 },
        })
        assert.equal(response.statusCode, 400)
        const result = response.json()
        assert.equal(result.data, null)
        assert.equal(result.error.code, 'VALIDATION_ERROR')
        assert.equal(result.error.message, 'Request validation failed')
        assert.ok(Array.isArray(result.error.issues))
        assert.ok(result.error.issues.length >= 2)
        for (const issue of result.error.issues) {
            assert.ok(Array.isArray(issue.path))
            assert.equal(typeof issue.code, 'string')
            assert.equal(typeof issue.message, 'string')
        }
    } finally {
        await app.close()
    }
})

test('malformed JSON, missing routes and unexpected exceptions use the same envelope', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    app.get('/__test/error', async () => {
        throw new Error('never-expose-private-internals')
    })
    try {
        const badJson = await app.inject({
            method: 'POST',
            url: '/projects/estimate',
            headers: { 'Content-Type': 'application/json' },
            payload: '{"hours":',
        })
        assert.equal(badJson.statusCode, 400)
        assert.deepEqual(Object.keys(badJson.json()).sort(), ['data', 'error'])
        assert.equal(badJson.json().error.code, 'BAD_REQUEST')

        const missing = await app.inject('/missing-route')
        assert.equal(missing.statusCode, 404)
        assert.equal(missing.json().error.code, 'NOT_FOUND')
        assert.equal(missing.json().data, null)

        const internal = await app.inject('/__test/error')
        assert.equal(internal.statusCode, 500)
        assert.deepEqual(internal.json(), {
            data: null,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred' },
        })
        assert.doesNotMatch(internal.body, /never-expose-private-internals/)
    } finally {
        await app.close()
    }
})

test('Fastify rate limits use RATE_LIMIT_EXCEEDED with status 429', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        let response
        for (let i = 0; i < 6; i++) {
            response = await app.inject({ method: 'POST', url: '/auth/login', payload: { login: 'demo', password: 'bad' } })
        }
        assert.equal(response?.statusCode, 429)
        assert.equal(response?.json().data, null)
        assert.equal(response?.json().error.code, 'RATE_LIMIT_EXCEEDED')
    } finally {
        await app.close()
    }
})
