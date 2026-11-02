import type { FastifyInstance } from 'fastify'
import { commonErrorResponses, dataResponseSchema, sendData, sendError } from '@platform/api-contract'
import { z } from 'zod'
import { demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'

const meRouteSchema = {
    tags: ['auth'],
    summary: 'Read current development session',
    response: {
        ...commonErrorResponses,
        200: dataResponseSchema(z.object({ user: z.object({ id: z.string() }) })),
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
            if (!auth) return reply.code(501).send(sendError('AUTH_NOT_CONFIGURED', 'Authentication is not configured'))
            const session = await auth.getSession(request.cookies[demoCookieName])
            if (!session) return reply.code(401).send(sendError('UNAUTHENTICATED', 'Authentication is required'))
            return sendData({ user: { id: session.userId } })
        }
    )
}
