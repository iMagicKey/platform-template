import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { DemoAuthService } from '../../modules/auth/auth.service.js'

export function registerAuthRoot(app: FastifyInstance, auth: DemoAuthService | undefined): void {
    app.get(
        '/auth',
        {
            schema: {
                tags: ['auth'],
                summary: 'Authentication availability',
                response: { 200: z.object({ configured: z.boolean() }) },
            },
        },
        async () => ({ configured: Boolean(auth) })
    )
}
