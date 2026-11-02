import assert from 'node:assert/strict'
import test from 'node:test'
import { hasNewRelease } from '../../apps/web/src/utils/release'

test('release banner only appears on an actual release mismatch', () => {
    assert.equal(hasNewRelease('abc', 'abc'), false)
    assert.equal(hasNewRelease('abc', 'def'), true)
    assert.equal(hasNewRelease('abc', ''), false)
})
