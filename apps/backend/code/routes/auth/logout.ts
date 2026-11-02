import type { FastifyInstance } from 'fastify'
import { dataResponseSchema, errorResponseSchema, sendData, sendError } from '@platform/api-contract'
import { demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'
import { requireAllowedOrigin } from '../../modules/auth/origin.js'
import type { BackendConfig } from '../../config.js'

const logoutRouteSchema = {
    tags: ['auth'],
    summary: 'Revoke development session',
    response: {
        200: dataResponseSchema(z.null()),
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
            if (!auth) return reply.code(501).send(sendError('AUTH_NOT_CONFIGURED', 'Authentication is not configured'))
            if (!requireAllowedOrigin(request.headers.origin, config.AUTH_ALLOWED_ORIGINS)) {
                return reply.code(403).send(sendError('ORIGIN_NOT_ALLOWED', 'Request origin is not allowed'))
            }
            await auth.revoke(request.cookies[demoCookieName])
            reply.clearCookie(demoCookieName, { path: '/' })
            return reply.code(200).send(sendData(null))
        }
    )
}
