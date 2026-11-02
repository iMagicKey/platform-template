import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'
import { requireAllowedOrigin } from '../../modules/auth/origin.js'
import type { BackendConfig } from '../../config.js'
import { errorResponseSchema } from '../../schemas/common.js'

const logoutRouteSchema = {
                tags: ['auth'],
                summary: 'Revoke development session',
                response: {
                    204: z.null(),
                    403: errorResponseSchema('ORIGIN_NOT_ALLOWED'),
                    501: errorResponseSchema('AUTH_NOT_CONFIGURED'),
                },
            }

export function registerAuthLogout(app: FastifyInstance, config: BackendConfig, auth: DemoAuthService | undefined): void {
    app.post(
        '/auth/logout',
        {
            schema: logoutRouteSchema,
        },
        async (request, reply) => {
            if (!auth) return reply.code(501).send({ error: 'AUTH_NOT_CONFIGURED' })
            if (!requireAllowedOrigin(request.headers.origin, config.AUTH_ALLOWED_ORIGINS)) {
                return reply.code(403).send({ error: 'ORIGIN_NOT_ALLOWED' })
            }
            await auth.revoke(request.cookies[demoCookieName])
            reply.clearCookie(demoCookieName, { path: '/' })
            return reply.code(204).send()
        }
    )
}
