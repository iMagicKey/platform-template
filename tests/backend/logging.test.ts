import assert from 'node:assert/strict'
import test from 'node:test'
import { createLoggerOptions } from '../../apps/backend/code/logging.js'
import { readConfig } from '../../apps/backend/code/config.js'

test('backend uses structured stdout logging by default with sensitive headers redacted', () => {
    const logger = createLoggerOptions(readConfig({ NODE_ENV: 'test' }))
    assert.equal(logger.transport, undefined)
    assert.equal(logger.level, 'info')
    assert.deepEqual(logger.base, { service: 'backend', environment: 'test', release: 'dev' })
    assert.deepEqual(logger.redact, {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'headers.authorization',
            'headers.cookie',
            'headers["set-cookie"]',
            'req.body.password',
            'password',
            'token',
            '*.token',
            'err.payload',
        ],
        censor: '[REDACTED]',
    })
})

test('backend file logging adds the unchanged daily rotating pino-roll transport', () => {
    const logger = createLoggerOptions(readConfig({ NODE_ENV: 'test', LOG_OUTPUT: 'file' }))
    assert.equal(logger.transport?.target, 'pino-roll')
    assert.equal(logger.transport?.options?.frequency, 'daily')
    assert.equal(logger.transport?.options?.size, '20m')
    assert.deepEqual(logger.transport?.options?.limit, { count: 14, removeOtherLogFiles: true })
})
