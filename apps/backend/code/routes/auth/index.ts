import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export function registerAuthRoot(app: FastifyInstance): void {
    app.get('/auth', {
        schema: {
            tags: ['auth'],
            summary: 'Authentication availability',
            response: { 200: z.object({ configured: z.literal(false) }) },
        },
    }, async () => ({ configured: false as const }))
}
