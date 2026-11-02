import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'
import { dataResponseSchema, errorResponseSchema, sendData, sendError } from '../../packages/api-contract/code/index.js'

test('success envelope retains array, scalar, null and object data', () => {
    const schema = dataResponseSchema(z.array(z.number()))
    assert.deepEqual(schema.parse(sendData([1, 2])), { data: [1, 2], error: null })
    assert.deepEqual(sendData('value'), { data: 'value', error: null })
    assert.deepEqual(sendData(null), { data: null, error: null })
    assert.deepEqual(sendData({ id: 'a' }), { data: { id: 'a' }, error: null })
})

test('error envelope supports exact codes and optional multiple issues', () => {
    const schema = errorResponseSchema('VALIDATION_ERROR')
    const issues = [
        { path: ['items', 0, 'quantity'], code: 'too_small', message: 'Expected positive quantity' },
        { path: ['email'], code: 'invalid_format', message: 'Invalid email' },
    ]
    assert.deepEqual(schema.parse(sendError('VALIDATION_ERROR', 'Invalid request', issues)), {
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request', issues },
    })
    assert.deepEqual(sendError('NOT_FOUND', 'Not found'), {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Not found' },
    })
    assert.equal(schema.safeParse({ data: { id: 'x' }, error: { code: 'VALIDATION_ERROR', message: 'Invalid' } }).success, false)
    assert.equal(schema.safeParse(sendError('OTHER', 'Other')).success, false)
})
