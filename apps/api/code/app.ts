import Fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { type ApiConfig, readConfig } from './config.js'
import { registerRoutes } from './routes/index.js'
import { APP_VERSION } from './consts/app.js'
import { createLoggerOptions } from './logging.js'
import { registerRequestLogging } from './plugins/request-logging.js'
import { registerErrorHandlers } from './plugins/error-handler.js'

export async function buildApp(config: ApiConfig = readConfig()) {
    const app = Fastify({
        logger: createLoggerOptions(config),
        disableRequestLogging: true,
    })
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    registerRequestLogging(app)
    registerErrorHandlers(app)
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
