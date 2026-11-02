import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../code/app.js'
import { readConfig } from '../code/config.js'
import { hashPassword } from '../code/modules/auth/auth.service.js'

const ORIGIN = 'http://localhost:8080'

async function createDemoApp() {
    const passwordHash = await hashPassword('nontrivial-test-password')
    return buildApp(readConfig({
        NODE_ENV: 'test', DOCS_ENABLED: 'false', AUTH_MODE: 'demo',
        AUTH_USERNAME: 'operator', AUTH_PASSWORD_HASH: passwordHash, AUTH_ALLOWED_ORIGINS: ORIGIN,
    }))
}

test('demo login, cookie session, identity and revocable logout', async () => {
    const app = await createDemoApp()
    try {
        const bad = await app.inject({ method: 'POST', url: '/auth/login',
            headers: { origin: ORIGIN }, payload: { login: 'operator', password: 'wrong' } })
        assert.equal(bad.statusCode, 401)
        const blocked = await app.inject({ method: 'POST', url: '/auth/login',
            headers: { origin: 'https://untrusted.example' }, payload: { login: 'operator', password: 'nontrivial-test-password' } })
        assert.equal(blocked.statusCode, 403)
        const loggedIn = await app.inject({ method: 'POST', url: '/auth/login',
            headers: { origin: ORIGIN }, payload: { login: 'operator', password: 'nontrivial-test-password' } })
        assert.equal(loggedIn.statusCode, 200)
        const rawCookie = loggedIn.headers['set-cookie']
        assert.equal(typeof rawCookie, 'string')
        const cookie = String(rawCookie).split(';')[0]!
        assert.match(cookie, /^dev-session=/)
        assert.match(String(rawCookie), /HttpOnly/)
        const user = await app.inject({ method: 'GET', url: '/auth/me', headers: { cookie } })
        assert.equal(user.statusCode, 200)
        assert.equal(user.json().user.id, 'operator')
        const logout = await app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie, origin: ORIGIN } })
        assert.equal(logout.statusCode, 204)
        assert.equal((await app.inject({ url: '/auth/me', headers: { cookie } })).statusCode, 401)
    } finally {
        await app.close()
    }
})

test('demo identity provider refuses production and missing configuration', async () => {
    const passwordHash = await hashPassword('test-password')
    assert.throws(() => readConfig({ NODE_ENV: 'production', AUTH_MODE: 'demo',
        AUTH_USERNAME: 'user', AUTH_PASSWORD_HASH: passwordHash, AUTH_ALLOWED_ORIGINS: ORIGIN }), /forbidden in production/)
    assert.throws(() => readConfig({ NODE_ENV: 'test', AUTH_MODE: 'demo' }), /AUTH_USERNAME/)
})
