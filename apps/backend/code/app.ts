import { readFileSync } from 'node:fs'
import type { ServerOptions as HttpsServerOptions } from 'node:https'
import Fastify, { type FastifyServerOptions } from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import websocket from '@fastify/websocket'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { readConfig, type BackendConfig } from './config.js'
import { registerRoutes } from './routes/index.js'
import { registerWebsocket } from './websocket/index.js'
import { createAuthService } from './modules/auth/auth.factory.js'
import { createLoggerOptions } from './logging.js'
import { registerRequestLogging } from './plugins/request-logging.js'
import { registerErrorHandlers } from './plugins/error-handler.js'
import { createStore, type RuntimeStore } from './store.js'
import { APP_VERSION } from './consts/app.js'

/** Fresh state per Fastify instance by default; production passes the process singleton. */
export async function buildApp(config: BackendConfig = readConfig(), state: RuntimeStore = createStore()) {
    const options: FastifyServerOptions & { https?: HttpsServerOptions } = {
        logger: createLoggerOptions(config),
        disableRequestLogging: true,
    }

    if (config.HTTPS_ENABLED) {
        options.https = {
            cert: readFileSync(config.TLS_CERT_PATH!),
            key: readFileSync(config.TLS_KEY_PATH!),
        }
    }

    const app = Fastify(options)
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    registerRequestLogging(app)
    registerErrorHandlers(app)
    if (config.CORS_ORIGINS.length) {
        await app.register(cors, { origin: config.CORS_ORIGINS, credentials: false })
    }
    await app.register(cookie)
    await app.register(rateLimit, { max: 120, timeWindow: '1 minute' })
    await app.register(swagger, {
        openapi: { info: { title: 'Platform Backend', version: APP_VERSION }, servers: [] },
        transform: jsonSchemaTransform,
    })
    if (config.DOCS_ENABLED) {
        await app.register(swaggerUi, { routePrefix: '/docs' })
    }
    await app.register(websocket)
    const auth = createAuthService(config)
    registerRoutes(app, config, auth, state)
    registerWebsocket(app, config, state)
    app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())
    return app
}
