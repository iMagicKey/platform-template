import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { APP_VERSION, SERVICE_NAME } from '../../consts/app.js'
import type { BackendConfig } from '../../config.js'

export function registerHealthRoute(app: FastifyInstance, config: BackendConfig): void {
    app.get('/health', {
        schema: {
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
        },
    }, async (_request, reply) => {
        reply.header('Cache-Control', 'no-store')
        return { status: 'ok' as const, ready: true, service: SERVICE_NAME, version: APP_VERSION, release: config.APP_RELEASE }
    })
}
