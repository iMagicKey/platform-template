import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { DemoAuthService } from '../../modules/auth/auth.service.js'

const authAvailabilityRouteSchema = {
                tags: ['auth'],
                summary: 'Authentication availability',
                response: { 200: z.object({ configured: z.boolean() }) },
            }

export function registerAuthRoot(app: FastifyInstance, auth: DemoAuthService | undefined): void {
    app.get(
        '/auth',
        {
            schema: authAvailabilityRouteSchema,
        },
        async () => ({ configured: Boolean(auth) })
    )
}
