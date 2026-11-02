import { resolve } from 'node:path'
import pino from 'pino'
import { readConfig } from './config.js'
import { createWorker } from './worker.js'
import { waitForTaskDrain } from './shutdown.js'

const config = readConfig()
const logger = pino({
    level: config.LOG_LEVEL,
    base: { service: 'worker', environment: config.NODE_ENV, release: config.APP_RELEASE },
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
const scheduler = createWorker(config, logger)
scheduler.start()
logger.info({ event: 'service.started' }, 'Worker started')
let closing = false
async function shutdown(signal: string) {
    if (closing) return
    closing = true
    // Stays armed after the drain: the library reports a timed-out task as idle while its promise may still hold Node open.
    const timeout = setTimeout(() => {
        logger.fatal({ event: 'service.shutdown.timeout' }, 'Worker shutdown deadline exceeded')
        process.exit(1)
    }, 10_000)
    timeout.unref()
    logger.info({ event: 'service.shutdown', signal }, 'Worker stopping')
    scheduler.stop()
    const drained = await waitForTaskDrain(() => Object.values(scheduler.getStatus()).some((task) => task.inProcess))
    if (!drained) logger.warn('Active scheduler tasks exceeded shutdown deadline')
    logger.flush()
    // Setting exitCode alone is not sufficient: the unresolved task may keep Node alive.
    if (!drained) process.exit(1)
}
process.once('SIGINT', () => {
    void shutdown('SIGINT')
})
process.once('SIGTERM', () => {
    void shutdown('SIGTERM')
})
