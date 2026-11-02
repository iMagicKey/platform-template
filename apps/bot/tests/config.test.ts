import assert from 'node:assert/strict'
import test from 'node:test'
import { readConfig } from '../code/config.js'

test('telegram bot is disabled by default', () => {
    assert.equal(readConfig({ NODE_ENV: 'test' }).BOT_ENABLED, false)
})
test('enabled Telegram bot requires a real token', () => {
    assert.throws(() => readConfig({ NODE_ENV: 'test', BOT_ENABLED: 'true' }), /BOT_TOKEN/)
    assert.equal(readConfig({ NODE_ENV: 'test', BOT_ENABLED: 'true', BOT_TOKEN: 'example-for-schema-only' }).BOT_ENABLED, true)
})
