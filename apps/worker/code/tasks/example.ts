import type { Logger } from 'pino'

/** Harmless demonstrator; replace with a real idempotent job. */
export async function exampleTask(logger: Logger): Promise<void> {
    logger.info({ event: 'scheduler.example.completed' }, 'Example task finished')
}
