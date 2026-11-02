import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'
import { errorResponseSchema } from '../../schemas/common.js'

const meRouteSchema = {
                tags: ['auth'],
                summary: 'Read current development session',
                response: {
                    200: z.object({ user: z.object({ id: z.string() }) }),
                    401: errorResponseSchema('UNAUTHENTICATED'),
                    501: errorResponseSchema('AUTH_NOT_CONFIGURED'),
                },
            }

export function registerAuthMe(app: FastifyInstance, auth: DemoAuthService | undefined): void {
    app.get(
        '/auth/me',
        {
            schema: meRouteSchema,
        },
        async (request, reply) => {
            reply.header('Cache-Control', 'no-store')
            if (!auth) return reply.code(501).send({ error: 'AUTH_NOT_CONFIGURED' })
            const session = await auth.getSession(request.cookies[demoCookieName])
            if (!session) return reply.code(401).send({ error: 'UNAUTHENTICATED' })
            return { user: { id: session.userId } }
        }
    )
}
