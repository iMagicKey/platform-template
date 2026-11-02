import type { FastifyInstance } from 'fastify'
import { commonErrorResponses, errorResponseSchema, dataResponseSchema, sendData, sendError } from '@platform/api-contract'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { z } from 'zod'
import { DEMO_SESSION_SECONDS, demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'
import { requireAllowedOrigin } from '../../modules/auth/origin.js'
import type { BackendConfig } from '../../config.js'

const loginRouteSchema = {
    tags: ['auth'],
    summary: 'Development-only login; never enabled in production',
    body: z.object({ login: z.string().min(1).max(128), password: z.string().min(1).max(512) }),
    response: {
        ...commonErrorResponses,
        200: dataResponseSchema(z.object({ user: z.object({ id: z.string() }) })),
        401: errorResponseSchema('INVALID_CREDENTIALS'),
        403: errorResponseSchema('ORIGIN_NOT_ALLOWED'),
        501: errorResponseSchema('AUTH_NOT_CONFIGURED'),
    },
}

export function registerAuthLogin(app: FastifyInstance, config: BackendConfig, auth: DemoAuthService | undefined): void {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/auth/login',
        {
            config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
            schema: loginRouteSchema,
        },
        async (request, reply) => {
            if (!auth) return reply.code(501).send(sendError('AUTH_NOT_CONFIGURED', 'Authentication is not configured'))
            if (!requireAllowedOrigin(request.headers.origin, config.AUTH_ALLOWED_ORIGINS)) {
                return reply.code(403).send(sendError('ORIGIN_NOT_ALLOWED', 'Request origin is not allowed'))
            }
            const { login, password } = request.body
            if (!(await auth.authenticate(login, password))) {
                return reply.code(401).send(sendError('INVALID_CREDENTIALS', 'Invalid login or password'))
            }
            const { token, session } = await auth.createSession()
            reply.setCookie(demoCookieName, token, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: config.HTTPS_ENABLED || request.protocol === 'https',
                maxAge: DEMO_SESSION_SECONDS,
            })
            reply.header('Cache-Control', 'no-store')
            return sendData({ user: { id: session.userId } })
        }
    )
}
