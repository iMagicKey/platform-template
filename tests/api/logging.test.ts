import assert from 'node:assert/strict'
import test from 'node:test'
import { createLoggerOptions } from '../../apps/api/code/logging.js'
import { readConfig } from '../../apps/api/code/config.js'

test('API uses stdout by default and redacts authorization and cookies', () => {
    const logger = createLoggerOptions(readConfig({ NODE_ENV: 'test' }))
    assert.equal(logger.transport, undefined)
    assert.equal(logger.level, 'info')
    assert.deepEqual(logger.base, { service: 'api', environment: 'test', release: 'dev' })
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

test('API file logging retains the rotating Pino transport', () => {
    const logger = createLoggerOptions(readConfig({ NODE_ENV: 'test', LOG_OUTPUT: 'file' }))
    assert.equal(logger.transport?.target, 'pino-roll')
    assert.equal(logger.transport?.options?.frequency, 'daily')
    assert.equal(logger.transport?.options?.size, '20m')
    assert.deepEqual(logger.transport?.options?.limit, { count: 14, removeOtherLogFiles: true })
})
