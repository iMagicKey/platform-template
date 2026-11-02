import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { pingService } from '../../modules/ping.js'

export function registerPing(app: FastifyInstance) {
    app.get(
        '/v1/ping',
        {
            schema: {
                tags: ['v1'],
                summary: 'Public service ping',
                response: { 200: z.object({ message: z.literal('pong') }) },
            },
        },
        async () => pingService()
    )
}
