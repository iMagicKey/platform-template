import type { Logger } from 'pino'
import { telegramErrorType } from './bot.js'

/** Stop the bot and force termination if its polling/startup loop does not settle. */
export async function stopBotSafely(
    stop: () => Promise<void>,
    logger: Logger,
    signal: string,
    exit: (code: number) => void = process.exit,
    deadlineMs = 10_000
): Promise<void> {
    const deadline = setTimeout(() => {
        logger.fatal({ event: 'service.shutdown.timeout' }, 'Bot shutdown deadline exceeded')
        logger.flush()
        exit(1)
    }, deadlineMs)
    deadline.unref()
    logger.info({ event: 'service.shutdown', signal }, 'Stopping Telegram bot')
    let exitCode = 0
    try {
        await stop()
    } catch (error) {
        exitCode = 1
        logger.error({ event: 'telegram.shutdown.failed', errorType: telegramErrorType(error) }, 'Telegram shutdown error')
    } finally {
        clearTimeout(deadline)
        logger.flush()
        // A settled stop() does not guarantee that grammY's startup retry loop has ended.
        exit(exitCode)
    }
}
