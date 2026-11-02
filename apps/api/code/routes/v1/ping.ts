import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { pingService } from '../../modules/ping.js'

const pingRouteSchema = {
                tags: ['v1'],
                summary: 'Public service ping',
                response: { 200: z.object({ message: z.literal('pong') }) },
            }

export function registerPing(app: FastifyInstance) {
    app.get(
        '/v1/ping',
        {
            schema: pingRouteSchema,
        },
        async () => pingService()
    )
}
