import Scheduler from 'imagic-scheduler'
import type { Logger } from 'pino'
import { exampleTask } from './tasks/example.js'
import type { WorkerConfig } from './config.js'

export function createWorker(config: WorkerConfig, logger: Logger) {
    const scheduler = new Scheduler({
        tickInterval: 1000,
        onError: (name, error) => logger.error({ event: 'scheduler.failed', task: name, err: error }),
        onTimeout: (name) => logger.warn({ event: 'scheduler.timeout', task: name }),
    })
    if (config.SCHEDULER_ENABLED) {
        scheduler.schedule('example', () => exampleTask(logger), {
            interval: config.SCHEDULER_INTERVAL_MS,
            timeout: 10_000,
            runImmediately: false,
        })
    }
    return scheduler
}
