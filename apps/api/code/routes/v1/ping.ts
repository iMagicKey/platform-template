import type { FastifyInstance } from 'fastify'
import { commonErrorResponses, dataResponseSchema, sendData } from '@platform/api-contract'
import { z } from 'zod'
import { pingService } from '../../modules/ping.js'

const pingRouteSchema = {
    tags: ['v1'],
    summary: 'Public service ping',
    response: {
        ...commonErrorResponses,
        200: dataResponseSchema(z.object({ message: z.literal('pong') })),
    },
}

export function registerPing(app: FastifyInstance) {
    app.get(
        '/v1/ping',
        {
            schema: pingRouteSchema,
        },
        async () => sendData(pingService())
    )
}
