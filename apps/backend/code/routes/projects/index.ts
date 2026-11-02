import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { listProjects, projectSchema } from '../../modules/projects/projects.service.js'

/** GET /projects. No database or authentication requirements. */
export function registerProjectsRoot(app: FastifyInstance): void {
    app.get('/projects', {
        schema: {
            tags: ['projects'],
            summary: 'List reference projects',
            response: { 200: z.object({ projects: z.array(projectSchema) }) },
        },
    }, async () => ({ projects: listProjects() }))
}
