import { resolve } from 'node:path'
import pino from 'pino'
import { readConfig } from './config.js'
import { createBot, telegramErrorType } from './bot.js'

const config = readConfig()
const logger = pino({
    level: config.LOG_LEVEL,
    base: { service: 'bot', environment: config.NODE_ENV, release: config.APP_RELEASE },
    ...(config.LOG_OUTPUT === 'file'
        ? {
              transport: {
                  target: 'pino-roll',
                  options: {
                      file: resolve(process.cwd(), 'logs', 'app'),
                      frequency: 'daily',
                      size: '20m',
                      limit: { count: 14, removeOtherLogFiles: true },
                      mkdir: true,
                  },
              },
          }
        : {}),
})
if (!config.BOT_ENABLED) {
    logger.info({ event: 'service.disabled' }, 'Bot is disabled (BOT_ENABLED=false)')
} else {
    const bot = createBot(config.BOT_TOKEN, logger)
    let closing = false
    async function shutdown(signal: string) {
        if (closing) return
        closing = true
        const shutdownDeadline = setTimeout(() => {
            logger.fatal({ event: 'service.shutdown.timeout' }, 'Bot shutdown deadline exceeded')
            process.exit(1)
        }, 10_000)
        shutdownDeadline.unref()
        logger.info({ event: 'service.shutdown', signal }, 'Stopping Telegram bot')
        try {
            await bot.stop()
        } catch (error) {
            logger.error({ event: 'telegram.shutdown.failed', errorType: telegramErrorType(error) }, 'Telegram shutdown error')
        }
        logger.flush()
        clearTimeout(shutdownDeadline)
    }
    process.once('SIGINT', () => {
        void shutdown('SIGINT')
    })
    process.once('SIGTERM', () => {
        void shutdown('SIGTERM')
    })
    try {
        await bot.start({ onStart: () => logger.info({ event: 'service.started' }, 'Telegram bot started') })
    } catch (error) {
        logger.fatal({ event: 'telegram.start.failed', errorType: telegramErrorType(error) }, 'Telegram bot failed')
        process.exitCode = 1
    }
}
