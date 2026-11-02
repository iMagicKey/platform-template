import type { FastifyInstance } from 'fastify'
import { commonErrorResponses, dataResponseSchema, sendData } from '@platform/api-contract'
import { z } from 'zod'
import type { DemoAuthService } from '../../modules/auth/auth.service.js'

const authAvailabilityRouteSchema = {
    tags: ['auth'],
    summary: 'Authentication availability',
    response: {
        ...commonErrorResponses,
        200: dataResponseSchema(z.object({ configured: z.boolean() })),
    },
}

export function registerAuthRoot(app: FastifyInstance, auth: DemoAuthService | undefined): void {
    app.get(
        '/auth',
        {
            schema: authAvailabilityRouteSchema,
        },
        async () => sendData({ configured: Boolean(auth) })
    )
}
