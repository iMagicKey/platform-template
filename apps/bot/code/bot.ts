import { Bot } from 'grammy'
import type { Logger } from 'pino'

/** Creates grammY bot without starting network polling. */
export function createBot(token: string, logger: Logger) {
    const bot = new Bot(token)
    bot.command('start', async (ctx) => {
        await ctx.reply('Hello from Universal Platform Template.')
    })
    bot.catch((error) => {
        logger.error({ event: 'telegram.update.failed', err: error.error, updateId: error.ctx.update.update_id }, 'Telegram update failed')
    })
    return bot
}
