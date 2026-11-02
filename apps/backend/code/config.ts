import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    HOST: z.string().min(1).default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3100),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_OUTPUT: z.enum(['stdout', 'file']).default('stdout'),
    APP_RELEASE: z.string().default('dev'),
    DOCS_ENABLED: z
        .enum(['auto', 'true', 'false'])
        .default('auto')
        .transform((x) => (x === 'auto' ? undefined : x === 'true')),
    CORS_ORIGINS: z
        .string()
        .default('')
        .transform((x) =>
            x
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
        ),
    HTTPS_ENABLED: z
        .enum(['true', 'false'])
        .default('false')
        .transform((x) => x === 'true'),
    TLS_CERT_PATH: z.string().optional(),
    TLS_KEY_PATH: z.string().optional(),
    AUTH_MODE: z.enum(['disabled', 'demo']).default('disabled'),
    ALLOW_DEMO_AUTH: z
        .enum(['true', 'false'])
        .default('false')
        .transform((x) => x === 'true'),
    AUTH_USERNAME: z.string().optional(),
    AUTH_PASSWORD_HASH: z.string().optional(),
    AUTH_FILE_PATH: z.string().min(1).optional(),
    AUTH_ALLOWED_ORIGINS: z
        .string()
        .default('')
        .transform((v) =>
            v
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean)
        ),
    WS_DEMO_TOKEN: z.string().optional(),
    WS_ALLOWED_ORIGINS: z
        .string()
        .default('http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080,http://127.0.0.1:8080')
        .transform((x) =>
            x
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
        ),
})

export type BackendConfig = z.infer<typeof envSchema>

export function readConfig(environment: NodeJS.ProcessEnv = process.env): BackendConfig {
    const config = envSchema.parse(environment)
    config.DOCS_ENABLED ??= config.NODE_ENV !== 'production'
    if (config.HTTPS_ENABLED && (!config.TLS_CERT_PATH || !config.TLS_KEY_PATH)) {
        throw new Error('HTTPS_ENABLED requires TLS_CERT_PATH and TLS_KEY_PATH')
    }
    if (config.AUTH_MODE === 'demo') {
        if (!config.ALLOW_DEMO_AUTH) throw new Error('Demo authentication requires explicit ALLOW_DEMO_AUTH=true')
        if (!['127.0.0.1', 'localhost', '::1'].includes(config.HOST)) throw new Error('Demo authentication requires loopback HOST')
        if (config.NODE_ENV === 'production') throw new Error('Demo authentication is forbidden in production')
        if (!config.AUTH_USERNAME || !config.AUTH_PASSWORD_HASH || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(config.AUTH_PASSWORD_HASH)) {
            throw new Error('Demo authentication requires AUTH_USERNAME and a valid AUTH_PASSWORD_HASH')
        }
        if (!config.AUTH_ALLOWED_ORIGINS.length) throw new Error('Demo authentication requires AUTH_ALLOWED_ORIGINS')
    }
    if (config.WS_DEMO_TOKEN && !['127.0.0.1', 'localhost', '::1'].includes(config.HOST)) {
        throw new Error('WS_DEMO_TOKEN requires loopback HOST')
    }
    if (config.NODE_ENV === 'production' && config.WS_DEMO_TOKEN) {
        throw new Error('WS_DEMO_TOKEN is a development-only example, not production authentication')
    }
    return config
}
