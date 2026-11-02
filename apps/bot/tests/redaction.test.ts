import assert from 'node:assert/strict'
import test from 'node:test'
import pino from 'pino'
import { Writable } from 'node:stream'
import { telegramErrorType } from '../code/bot.js'

test('Telegram errors never expose canary token or message in logged fields', () => {
    const secret = 'CANARY-BOT-TOKEN-SECRET'
    const data: string[] = []
    const stream = new Writable({
        write(chunk, _encoding, cb) {
            data.push(String(chunk))
            cb()
        },
    })
    const logger = pino(stream)
    const cause = new Error('request to https://api.telegram.org/bot' + secret + '/getUpdates failed')
    cause.name = 'HttpError'
    logger.error({ event: 'telegram.start.failed', errorType: telegramErrorType(cause) }, 'Telegram bot failed')
    assert.ok(!data.join('').includes(secret))
    assert.equal(telegramErrorType(cause), 'HttpError')
})
