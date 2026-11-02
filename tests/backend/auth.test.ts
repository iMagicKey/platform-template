import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildApp } from '../../apps/backend/code/app.js'
import { readConfig } from '../../apps/backend/code/config.js'
import { hashPassword } from '../../apps/backend/code/modules/auth/auth.service.js'

const ORIGIN = 'http://localhost:8080'

async function createDemoApp(file: string) {
    const passwordHash = await hashPassword('nontrivial-test-password')
    return buildApp(
        readConfig({
            NODE_ENV: 'test',
            DOCS_ENABLED: 'false',
            AUTH_MODE: 'demo',
            ALLOW_DEMO_AUTH: 'true',
            AUTH_USERNAME: 'operator',
            AUTH_PASSWORD_HASH: passwordHash,
            AUTH_ALLOWED_ORIGINS: ORIGIN,
            AUTH_FILE_PATH: file,
        })
    )
}

test('demo login, cookie session, identity and revocable logout', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-auth-'))
    const app = await createDemoApp(join(dir, 'sessions.json'))
    try {
        const bad = await app.inject({
            method: 'POST',
            url: '/auth/login',
            headers: { origin: ORIGIN },
            payload: { login: 'operator', password: 'wrong' },
        })
        assert.equal(bad.statusCode, 401)
        assert.equal(bad.json().data, null)
        assert.equal(bad.json().error.code, 'INVALID_CREDENTIALS')
        const blocked = await app.inject({
            method: 'POST',
            url: '/auth/login',
            headers: { origin: 'https://untrusted.example' },
            payload: { login: 'operator', password: 'nontrivial-test-password' },
        })
        assert.equal(blocked.statusCode, 403)
        assert.equal(blocked.json().error.code, 'ORIGIN_NOT_ALLOWED')
        const loggedIn = await app.inject({
            method: 'POST',
            url: '/auth/login',
            headers: { origin: ORIGIN },
            payload: { login: 'operator', password: 'nontrivial-test-password' },
        })
        assert.equal(loggedIn.statusCode, 200)
        assert.deepEqual(loggedIn.json(), { data: { user: { id: 'operator' } }, error: null })
        const rawCookie = loggedIn.headers['set-cookie']
        assert.equal(typeof rawCookie, 'string')
        const cookie = String(rawCookie).split(';')[0]!
        assert.match(cookie, /^dev-session=/)
        assert.match(String(rawCookie), /HttpOnly/)
        const user = await app.inject({ method: 'GET', url: '/auth/me', headers: { cookie } })
        assert.equal(user.statusCode, 200)
        assert.equal(user.json().data.user.id, 'operator')
        const logout = await app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie, origin: ORIGIN } })
        assert.equal(logout.statusCode, 200)
        assert.deepEqual(logout.json(), { data: null, error: null })
        assert.equal((await app.inject({ url: '/auth/me', headers: { cookie } })).statusCode, 401)
    } finally {
        await app.close()
        await rm(dir, { recursive: true, force: true })
    }
})

test('demo identity provider refuses production and missing configuration', async () => {
    const passwordHash = await hashPassword('test-password')
    assert.throws(
        () =>
            readConfig({
                NODE_ENV: 'production',
                AUTH_MODE: 'demo',
                ALLOW_DEMO_AUTH: 'true',
                AUTH_USERNAME: 'user',
                AUTH_PASSWORD_HASH: passwordHash,
                AUTH_ALLOWED_ORIGINS: ORIGIN,
            }),
        /forbidden in production/
    )
    assert.throws(() => readConfig({ NODE_ENV: 'test', AUTH_MODE: 'demo', ALLOW_DEMO_AUTH: 'true' }), /AUTH_USERNAME/)
})

test('file-backed demo sessions survive app restart and are revoked across restarts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-auth-'))
    const file = join(dir, 'sessions.json')
    try {
        const first = await createDemoApp(file)
        let cookie = ''
        try {
            const login = await first.inject({
                method: 'POST',
                url: '/auth/login',
                headers: { origin: ORIGIN },
                payload: { login: 'operator', password: 'nontrivial-test-password' },
            })
            assert.equal(login.statusCode, 200)
            cookie = String(login.headers['set-cookie']).split(';')[0]!
        } finally {
            await first.close()
        }

        const second = await createDemoApp(file)
        try {
            const current = await second.inject({ url: '/auth/me', headers: { cookie } })
            assert.equal(current.statusCode, 200)
            assert.equal(current.json().data.user.id, 'operator')
            const logout = await second.inject({ method: 'POST', url: '/auth/logout', headers: { cookie, origin: ORIGIN } })
            assert.equal(logout.statusCode, 200)
        } finally {
            await second.close()
        }

        const third = await createDemoApp(file)
        try {
            assert.equal((await third.inject({ url: '/auth/me', headers: { cookie } })).statusCode, 401)
        } finally {
            await third.close()
        }
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
})
