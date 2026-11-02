import assert from 'node:assert/strict'
import test from 'node:test'
import { waitForTaskDrain } from '../code/shutdown.js'

test('scheduler shutdown returns immediately when no task is active', async () => {
    assert.equal(await waitForTaskDrain(() => false, 0), true)
})

test('scheduler shutdown reports a task that cannot drain before deadline', async () => {
    assert.equal(await waitForTaskDrain(() => true, 0), false)
})

test('scheduler shutdown allows a task to finish before the deadline', async () => {
    let polls = 0
    assert.equal(await waitForTaskDrain(() => ++polls < 3, 500), true)
})
