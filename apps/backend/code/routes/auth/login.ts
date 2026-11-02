import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { z } from 'zod'
import { DEMO_SESSION_SECONDS, demoCookieName, type DemoAuthService } from '../../modules/auth/auth.service.js'
import { requireAllowedOrigin } from '../../modules/auth/origin.js'
import type { BackendConfig } from '../../config.js'

export function registerAuthLogin(app: FastifyInstance, config: BackendConfig, auth: DemoAuthService | undefined): void {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/auth/login',
        {
            config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
            schema: {
                tags: ['auth'],
                summary: 'Development-only login; never enabled in production',
                body: z.object({ login: z.string().min(1).max(128), password: z.string().min(1).max(512) }),
                response: {
                    200: z.object({ user: z.object({ id: z.string() }) }),
                    401: z.object({ error: z.literal('INVALID_CREDENTIALS') }),
                    403: z.object({ error: z.literal('ORIGIN_NOT_ALLOWED') }),
                    501: z.object({ error: z.literal('AUTH_NOT_CONFIGURED') }),
                },
            },
        },
        async (request, reply) => {
            if (!auth) return reply.code(501).send({ error: 'AUTH_NOT_CONFIGURED' })
            if (!requireAllowedOrigin(request.headers.origin, config.AUTH_ALLOWED_ORIGINS)) {
                return reply.code(403).send({ error: 'ORIGIN_NOT_ALLOWED' })
            }
            const { login, password } = request.body
            if (!(await auth.authenticate(login, password))) {
                return reply.code(401).send({ error: 'INVALID_CREDENTIALS' })
            }
            const { token, session } = auth.createSession()
            reply.setCookie(demoCookieName, token, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: false,
                maxAge: DEMO_SESSION_SECONDS,
            })
            reply.header('Cache-Control', 'no-store')
            return { user: { id: session.userId } }
        }
    )
}
