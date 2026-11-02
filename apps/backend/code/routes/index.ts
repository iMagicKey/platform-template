import type { FastifyInstance } from 'fastify'
import type { BackendConfig } from '../config.js'
import { registerAuthRoot } from './auth/index.js'
import { registerAuthLogin } from './auth/login.js'
import { registerHealthRoute } from './health/index.js'
import { registerProjectsRoot } from './projects/index.js'
import { registerProjectEstimate } from './projects/estimate.js'

/** The only HTTP route registry. Nested index.ts files are route endpoints. */
export function registerRoutes(app: FastifyInstance, config: BackendConfig): void {
    registerHealthRoute(app, config)
    registerAuthRoot(app)
    registerAuthLogin(app)
    registerProjectsRoot(app)
    registerProjectEstimate(app)
}
