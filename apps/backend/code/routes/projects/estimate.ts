import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { estimateProject, estimateRequestSchema, estimateResponseSchema, markProjectEstimated } from '../../modules/projects/projects.service.js'
import type { RuntimeStore } from '../../store.js'

/** A complete POST route with request/response validation and isolated business logic. */
export function registerProjectEstimate(app: FastifyInstance, state: RuntimeStore): void {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/projects/estimate',
        {
            schema: {
                tags: ['projects'],
                summary: 'Estimate project cost in integer cents',
                body: estimateRequestSchema,
                response: { 200: estimateResponseSchema },
            },
        },
        async (request) => {
            const estimate = estimateProject(request.body)
            markProjectEstimated(state)
            return estimate
        }
    )
}
