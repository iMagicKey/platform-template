import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ApiConfig } from '../../config.js'
import { APP_VERSION, SERVICE_NAME } from '../../consts/app.js'

const healthRouteSchema = {
    hide: true,
    response: {
        200: z.object({
            status: z.literal('ok'),
            ready: z.boolean(),
            service: z.string(),
            version: z.string(),
            release: z.string(),
        }),
    },
}

export function registerHealth(app: FastifyInstance, config: ApiConfig) {
    app.get(
        '/health',
        {
            schema: healthRouteSchema,
        },
        async (_request, reply) => {
            reply.header('Cache-Control', 'no-store')
            return { status: 'ok' as const, ready: true, service: SERVICE_NAME, version: APP_VERSION, release: config.APP_RELEASE }
        }
    )
}
