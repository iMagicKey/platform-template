import { resolve } from 'node:path'
import Fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { type ApiConfig, readConfig } from './config.js'
import { registerRoutes } from './routes/index.js'
import { APP_VERSION, SERVICE_NAME } from './consts/app.js'

export async function buildApp(config: ApiConfig = readConfig()) {
    const app = Fastify({
        logger: {
            level: config.LOG_LEVEL,
            base: { service: SERVICE_NAME, environment: config.NODE_ENV, release: config.APP_RELEASE },
            redact: { paths: ['req.headers.authorization', 'req.headers.cookie'], censor: '[REDACTED]' },
            ...(config.LOG_OUTPUT === 'file' ? {
                transport: { target: 'pino-roll', options: { file: resolve(process.cwd(), 'logs', 'app'), frequency: 'daily', mkdir: true } },
            } : {}),
        },
        disableRequestLogging: true,
    })
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    app.addHook('onResponse', async (request, reply) => {
        app.log.info({
            event: 'http.request.completed', requestId: request.id, method: request.method,
            route: request.routeOptions.url ?? '<unmatched>', statusCode: reply.statusCode,
            durationMs: Math.round(reply.elapsedTime),
        }, 'HTTP request')
    })
    await app.register(rateLimit, { max: 180, timeWindow: '1 minute' })
    await app.register(swagger, {
        openapi: { info: { title: 'Independent Platform API', version: APP_VERSION }, servers: [] },
        transform: jsonSchemaTransform,
    })
    if (config.DOCS_ENABLED) await app.register(swaggerUi, { routePrefix: '/docs' })
    registerRoutes(app, config)
    app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())
    return app
}
