import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { AuthenticationUnavailableError, login } from '../../modules/auth/auth.service.js'

export function registerAuthLogin(app: FastifyInstance): void {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/auth/login',
        {
            schema: {
                tags: ['auth'],
                summary: 'Login integration placeholder (disabled)',
                body: z.object({ login: z.string().min(1), password: z.string().min(1) }),
                response: { 501: z.object({ error: z.string() }) },
            },
        },
        async (_request, reply) => {
            try {
                await login()
            } catch (error) {
                if (error instanceof AuthenticationUnavailableError) {
                    return reply.code(501).send({ error: 'AUTH_NOT_CONFIGURED' })
                }
                throw error
            }
            return reply.code(501).send({ error: 'AUTH_NOT_CONFIGURED' })
        }
    )
}
