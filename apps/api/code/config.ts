import { z } from 'zod'

const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    HOST: z.string().min(1).default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3200),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_OUTPUT: z.enum(['stdout', 'file']).default('stdout'),
    APP_RELEASE: z.string().default('dev'),
    DOCS_ENABLED: z
        .enum(['auto', 'true', 'false'])
        .default('auto')
        .transform((x) => (x === 'auto' ? undefined : x === 'true')),
})
export type ApiConfig = z.infer<typeof schema>
export function readConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
    const config = schema.parse(env)
    config.DOCS_ENABLED ??= config.NODE_ENV !== 'production'
    return config
}
