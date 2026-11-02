import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'

export function registerAuthMe(app: FastifyInstance, auth: DemoAuthService | undefined): void {
    app.get('/auth/me', {
        schema: {
            tags: ['auth'],
            summary: 'Read current development session',
            response: {
                200: z.object({ user: z.object({ id: z.string() }) }),
                401: z.object({ error: z.literal('UNAUTHENTICATED') }),
                501: z.object({ error: z.literal('AUTH_NOT_CONFIGURED') }),
            },
        },
    }, async (request, reply) => {
        reply.header('Cache-Control', 'no-store')
        if (!auth) return reply.code(501).send({ error: 'AUTH_NOT_CONFIGURED' })
        const session = auth.getSession(request.cookies[demoCookieName])
        if (!session) return reply.code(401).send({ error: 'UNAUTHENTICATED' })
        return { user: { id: session.userId } }
    })
}
