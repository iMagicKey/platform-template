import { Bot } from 'grammy'
import type { Logger } from 'pino'

/** Untrusted Telegram error text may include the bot token, URLs and message payloads. */
export function telegramErrorType(error: unknown): string {
    if (!(error instanceof Error)) return 'UnknownError'
    if (error.name === 'HttpError') return 'HttpError'
    if (error.name === 'GrammyError') return 'GrammyError'
    return 'UnexpectedError'
}

/** Creates grammY bot without starting network polling. */
export function createBot(token: string, logger: Logger) {
    const bot = new Bot(token)
    bot.command('start', async (ctx) => {
        await ctx.reply('Hello from Universal Platform Template.')
    })
    bot.catch((error) => {
        logger.error({ event: 'telegram.update.failed', updateId: error.ctx.update.update_id, errorType: telegramErrorType(error.error) }, 'Telegram update failed')
    })
    return bot
}
