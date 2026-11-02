import { resolve } from 'node:path'
import type { LoggerOptions } from 'pino'
import type { ApiConfig } from './config.js'
import { SERVICE_NAME } from './consts/app.js'

const SENSITIVE_LOG_PATHS = [
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]',
    'headers.authorization',
    'headers.cookie',
    'headers["set-cookie"]',
    'req.body.password',
    'password',
    'token',
    '*.token',
    'err.payload',
]

export function createLoggerOptions(config: ApiConfig): LoggerOptions {
    const logger: LoggerOptions = {
        level: config.LOG_LEVEL,
        base: { service: SERVICE_NAME, environment: config.NODE_ENV, release: config.APP_RELEASE },
        redact: { paths: SENSITIVE_LOG_PATHS, censor: '[REDACTED]' },
    }

    if (config.LOG_OUTPUT === 'file') {
        logger.transport = {
            target: 'pino-roll',
            options: {
                file: resolve(process.cwd(), 'logs', 'app'),
                frequency: 'daily',
                size: '20m',
                limit: { count: 14, removeOtherLogFiles: true },
                mkdir: true,
            },
        }
    }

    return logger
}
