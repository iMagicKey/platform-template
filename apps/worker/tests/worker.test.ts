import assert from 'node:assert/strict'
import test from 'node:test'
import pino from 'pino'
import { createWorker } from '../code/worker.js'
import { readConfig } from '../code/config.js'

test('worker schedules only when enabled and stops cleanly', () => {
    const logger = pino({ enabled: false })
    const enabled = createWorker(readConfig({ NODE_ENV: 'test', SCHEDULER_ENABLED: 'true' }), logger)
    assert.ok(enabled.getStatus().example)
    enabled.start()
    assert.equal(enabled.isRunning(), true)
    enabled.stop()
    assert.equal(enabled.isRunning(), false)
    const disabled = createWorker(readConfig({ NODE_ENV: 'test', SCHEDULER_ENABLED: 'false' }), logger)
    assert.deepEqual(disabled.getStatus(), {})
})
