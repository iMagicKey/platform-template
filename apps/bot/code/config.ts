import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_OUTPUT: z.enum(['stdout', 'file']).default('stdout'),
    APP_RELEASE: z.string().default('dev'),
    BOT_ENABLED: z.enum(['true', 'false']).default('false').transform((x) => x === 'true'),
    BOT_TOKEN: z.string().default(''),
})
export type BotConfig = z.infer<typeof envSchema>
export function readConfig(env: NodeJS.ProcessEnv = process.env): BotConfig {
    const config = envSchema.parse(env)
    if (config.BOT_ENABLED && !config.BOT_TOKEN.trim()) throw new Error('BOT_TOKEN is required when BOT_ENABLED=true')
    return config
}
