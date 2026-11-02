import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../code/app.js'
import { readConfig } from '../code/config.js'

test('production disables docs and refuses demo authentication', async () => {
    const config = readConfig({ NODE_ENV: 'production', DOCS_ENABLED: 'auto' })
    assert.equal(config.DOCS_ENABLED, false)
    const app = await buildApp(config)
    try {
        assert.equal((await app.inject('/docs')).statusCode, 404)
        assert.equal((await app.inject('/openapi.json')).statusCode, 404)
        assert.equal((await app.inject('/health')).statusCode, 200)
    } finally {
        await app.close()
    }
    assert.throws(() => readConfig({ NODE_ENV: 'production', AUTH_MODE: 'demo', ALLOW_DEMO_AUTH: 'true' }), /forbidden in production/)
    assert.throws(() => readConfig({ NODE_ENV: 'development', AUTH_MODE: 'demo' }), /ALLOW_DEMO_AUTH/)
    assert.throws(() => readConfig({ NODE_ENV: 'development', HOST: '0.0.0.0', WS_DEMO_TOKEN: 'example' }), /loopback HOST/)
})

test('rate limits are per forwarded client and do not affect health', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'false' }))
    try {
        const opts = (ip: string) => ({
            method: 'POST' as const,
            url: '/auth/login',
            headers: { 'x-forwarded-for': ip },
            remoteAddress: '127.0.0.1',
            payload: { login: 'bad', password: 'bad' },
        })
        for (let i = 0; i < 5; i++) {
            assert.equal((await app.inject(opts('198.51.100.1'))).statusCode, 501)
        }
        assert.equal((await app.inject(opts('198.51.100.1'))).statusCode, 429)
        assert.equal((await app.inject(opts('198.51.100.2'))).statusCode, 501)
        for (let i = 0; i < 130; i++) {
            assert.equal(
                (await app.inject({ url: '/health', headers: { 'x-forwarded-for': '198.51.100.1' }, remoteAddress: '127.0.0.1' })).statusCode,
                200
            )
        }
    } finally {
        await app.close()
    }
})

test('real WebSocket handshake and ping/pong work with an explicitly allowed ticket', async () => {
    const app = await buildApp(
        readConfig({
            NODE_ENV: 'test',
            DOCS_ENABLED: 'false',
            WS_DEMO_TOKEN: 'test-ticket',
            WS_ALLOWED_ORIGINS: 'http://localhost:8080',
        })
    )
    await app.ready()
    let socket: Awaited<ReturnType<typeof app.injectWS>> | undefined
    try {
        socket = await app.injectWS('/ws', {
            headers: { origin: 'http://localhost:8080', 'sec-websocket-protocol': 'ticket.test-ticket' },
        })
        const reply = new Promise<string>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('WebSocket ping timeout')), 2_000)
            socket!.once('message', (value) => {
                clearTimeout(timer)
                resolve(String(value))
            })
        })
        socket.send(JSON.stringify({ type: 'ping' }))
        assert.deepEqual(JSON.parse(await reply), { type: 'pong' })
    } finally {
        socket?.terminate()
        await app.close()
    }
})
