import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_OUTPUT: z.enum(['stdout', 'file']).default('stdout'),
    APP_RELEASE: z.string().default('dev'),
    SCHEDULER_ENABLED: z
        .enum(['true', 'false'])
        .default('true')
        .transform((x) => x === 'true'),
    SCHEDULER_INTERVAL_MS: z.coerce.number().int().min(1000).default(60_000),
})
export type WorkerConfig = z.infer<typeof envSchema>
export const readConfig = (environment: NodeJS.ProcessEnv = process.env) => envSchema.parse(environment)
