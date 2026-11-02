import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import websocket from '@fastify/websocket'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { readConfig, type BackendConfig } from './config.js'
import { registerRoutes } from './routes/index.js'
import { registerWebsocket } from './websocket/index.js'
import { APP_VERSION, SERVICE_NAME } from './consts/app.js'

export async function buildApp(config: BackendConfig = readConfig()) {
    const logger = {
        level: config.LOG_LEVEL,
        base: { service: SERVICE_NAME, environment: config.NODE_ENV, release: config.APP_RELEASE },
        redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'headers.authorization', 'headers.cookie'], censor: '[REDACTED]' },
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
    }
    const app = Fastify({
        logger,
        disableRequestLogging: true,
        ...(config.HTTPS_ENABLED
            ? {
                  https: {
                      cert: readFileSync(config.TLS_CERT_PATH!),
                      key: readFileSync(config.TLS_KEY_PATH!),
                  },
              }
            : {}),
    })
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    app.addHook('onResponse', async (request, reply) => {
        app.log.info(
            {
                event: 'http.request.completed',
                requestId: request.id,
                method: request.method,
                route: request.routeOptions.url ?? '<unmatched>',
                statusCode: reply.statusCode,
                durationMs: Math.round(reply.elapsedTime),
            },
            'HTTP request'
        )
    })
    if (config.CORS_ORIGINS.length) {
        await app.register(cors, { origin: config.CORS_ORIGINS, credentials: false })
    }
    await app.register(rateLimit, { max: 120, timeWindow: '1 minute' })
    await app.register(swagger, {
        openapi: { info: { title: 'Platform Backend', version: APP_VERSION }, servers: [] },
        transform: jsonSchemaTransform,
    })
    if (config.DOCS_ENABLED) {
        await app.register(swaggerUi, { routePrefix: '/docs' })
    }
    await app.register(websocket)
    registerRoutes(app, config)
    registerWebsocket(app, config)
    app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())
    return app
}
