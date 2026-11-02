import type { FastifyInstance } from 'fastify'
import { commonErrorResponses, dataResponseSchema, sendData } from '@platform/api-contract'
import { z } from 'zod'
import { listProjects, projectSchema } from '../../modules/projects/projects.service.js'

/** GET /projects. No database or authentication requirements. */
const projectsRouteSchema = {
    tags: ['projects'],
    summary: 'List reference projects',
    response: {
        ...commonErrorResponses,
        200: dataResponseSchema(z.object({ projects: z.array(projectSchema) })),
    },
}

export function registerProjectsRoot(app: FastifyInstance): void {
    app.get(
        '/projects',
        {
            schema: projectsRouteSchema,
        },
        async () => sendData({ projects: listProjects() })
    )
}
