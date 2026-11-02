import type { FastifyInstance } from 'fastify'

/** HTTP completion events are separate from Pino transport configuration. */
export function registerRequestLogging(app: FastifyInstance): void {
    app.addHook('onResponse', async (request, reply) => {
        app.log.info(
            {
                event: 'http.request.completed',
                requestId: request.id,
                method: request.method,
                route: request.routeOptions.url ?? '<unmatched>',
                statusCode: reply.statusCode,
                durationMs: Math.round(reply.elapsedTime),
            },
            'HTTP request'
        )
    })
}
