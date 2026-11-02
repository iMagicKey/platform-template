import type { FastifyInstance } from 'fastify'
import { commonErrorResponses, dataResponseSchema, sendData } from '@platform/api-contract'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { estimateProject, estimateRequestSchema, estimateResponseSchema, markProjectEstimated } from '../../modules/projects/projects.service.js'
import type { RuntimeStore } from '../../store.js'

/** A complete POST route with request/response validation and isolated business logic. */
const estimateRouteSchema = {
    tags: ['projects'],
    summary: 'Estimate project cost in integer cents',
    body: estimateRequestSchema,
    response: {
        ...commonErrorResponses,
        200: dataResponseSchema(estimateResponseSchema),
    },
}

export function registerProjectEstimate(app: FastifyInstance, state: RuntimeStore): void {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/projects/estimate',
        {
            schema: estimateRouteSchema,
        },
        async (request) => {
            const estimate = estimateProject(request.body)
            markProjectEstimated(state)
            return sendData(estimate)
        }
    )
}
