import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiRequestError, readApiResponse } from '../../apps/web/src/libs/apiClient'

test('web client reads a successful typed envelope with null and scalar data', async () => {
    const success = await readApiResponse<number>(Response.json({ data: 17, error: null }))
    assert.deepEqual(success, { data: 17, error: null })
    const empty = await readApiResponse<null>(Response.json({ data: null, error: null }))
    assert.deepEqual(empty, { data: null, error: null })
})

test('web client uses API error codes and rejects malformed envelopes', async () => {
    await assert.rejects(
        () => readApiResponse<unknown>(Response.json({ data: null, error: { code: 'UNAUTHENTICATED', message: 'Login required' } }, { status: 401 })),
        (error: unknown) => error instanceof ApiRequestError && error.status === 401 && error.code === 'UNAUTHENTICATED'
    )
    await assert.rejects(() => readApiResponse(Response.json({ user: 1 })), /Invalid API response envelope/)
    await assert.rejects(
        () => readApiResponse(Response.json({ data: 'secret', error: { code: 'FAIL', message: 'failed' } }, { status: 400 })),
        /Invalid API response envelope/
    )
    await assert.rejects(() => readApiResponse(new Response('<html>Proxy error</html>', { status: 502 })), /invalid JSON response/)
})

test('frontend receives every structured validation issue', async () => {
    const issues = [
        { path: ['profile', 'email'], code: 'invalid_format', message: 'Invalid email' },
        { path: ['items', 0, 'quantity'], code: 'too_small', message: 'Invalid quantity' },
    ]
    await assert.rejects(
        () =>
            readApiResponse(Response.json({ data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', issues } }, { status: 400 })),
        (error: unknown) =>
            error instanceof ApiRequestError && error.code === 'VALIDATION_ERROR' && JSON.stringify(error.issues) === JSON.stringify(issues)
    )
})

test('requestApi does not send JSON content type on bodyless logout', async () => {
    const { requestApi } = await import('../libs/apiClient')
    const originalFetch = globalThis.fetch
    let sentHeaders: Headers | undefined
    globalThis.fetch = async (_url, init) => {
        sentHeaders = new Headers(init?.headers)
        return Response.json({ data: null, error: null })
    }
    try {
        await requestApi<null>('/api/auth/logout', { method: 'POST' })
        assert.equal(sentHeaders?.has('Content-Type'), false)
        await requestApi<null>('/api/auth/logout', { method: 'POST', body: '{}' })
        assert.equal(sentHeaders?.get('Content-Type'), 'application/json')
    } finally {
        globalThis.fetch = originalFetch
    }
})
