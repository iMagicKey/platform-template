import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { Writable } from 'node:stream'
import test from 'node:test'
import pino from 'pino'
import { stopBotSafely } from '../../apps/bot/code/shutdown.js'

const logger = pino({ enabled: false })

test('bot shutdown exits cleanly when stop completes', async () => {
    const exitCodes: number[] = []
    await stopBotSafely(
        async () => {},
        logger,
        'SIGTERM',
        (code) => exitCodes.push(code),
        50
    )
    assert.deepEqual(exitCodes, [0])
})

test('bot shutdown exits nonzero without logging raw Telegram errors', async () => {
    const exitCodes: number[] = []
    const messages: string[] = []
    const sink = new Writable({
        write(chunk, _encoding, callback) {
            messages.push(String(chunk))
            callback()
        },
    })
    const captureLogger = pino(sink)
    await stopBotSafely(
        async () => {
            throw new Error('https://api.telegram.org/botCANARY-SECRET/getUpdates failed')
        },
        captureLogger,
        'SIGTERM',
        (code) => exitCodes.push(code),
        50
    )
    assert.deepEqual(exitCodes, [1])
    assert.ok(!messages.join('').includes('CANARY-SECRET'))
})

test('bot shutdown enforces its deadline even when stop never settles', async () => {
    const exitCodes: number[] = []
    void stopBotSafely(
        () => new Promise<void>(() => {}),
        logger,
        'SIGTERM',
        (code) => exitCodes.push(code),
        1
    )
    await delay(30)
    assert.deepEqual(exitCodes, [1])
})
