import assert from 'node:assert/strict'
import test from 'node:test'
import { SignJWT } from 'jose'
import { issueApiToken, verifyApiToken } from '../../apps/backend/code/modules/auth/jwt.js'

test('api JWT is limited to its audience and issuer', async () => {
    const secret = new TextEncoder().encode('a-secret-value-with-more-than-32-bytes-for-tests')
    const token = await issueApiToken(secret, { subject: 'user-1', audience: 'orders-api', issuer: 'backend', scope: 'orders:read' })
    assert.equal((await verifyApiToken(token, secret, 'backend', 'orders-api')).sub, 'user-1')
    await assert.rejects(() => verifyApiToken(token, secret, 'backend', 'payments-api'))
})

test('API JWT rejects missing expiry and weak verification secrets', async () => {
    const secret = new TextEncoder().encode('a-secret-value-with-more-than-32-bytes-for-tests')
    const token = await new SignJWT({ scope: 'read' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject('user-1')
        .setAudience('orders-api')
        .setIssuer('backend')
        .setIssuedAt()
        .sign(secret)
    await assert.rejects(() => verifyApiToken(token, secret, 'backend', 'orders-api'))
    const normal = await issueApiToken(secret, { subject: 'user-1', audience: 'orders-api', issuer: 'backend', scope: 'read' })
    await assert.rejects(() => verifyApiToken(normal, new TextEncoder().encode('weak'), 'backend', 'orders-api'))
})
