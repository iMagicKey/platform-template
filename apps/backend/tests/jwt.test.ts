import assert from 'node:assert/strict'
import test from 'node:test'
import { issueApiToken, verifyApiToken } from '../code/modules/auth/jwt.js'

test('api JWT is limited to its audience and issuer', async () => {
    const secret = new TextEncoder().encode('a-secret-value-with-more-than-32-bytes-for-tests')
    const token = await issueApiToken(secret, { subject: 'user-1', audience: 'orders-api', issuer: 'backend', scope: 'orders:read' })
    assert.equal((await verifyApiToken(token, secret, 'backend', 'orders-api')).sub, 'user-1')
    await assert.rejects(() => verifyApiToken(token, secret, 'backend', 'payments-api'))
})
