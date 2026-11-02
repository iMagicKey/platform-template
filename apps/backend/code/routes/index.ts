import type { FastifyInstance } from 'fastify'
import type { BackendConfig } from '../config.js'
import type { RuntimeStore } from '../store.js'
import { registerAuthRoot } from './auth/index.js'
import { registerAuthLogin } from './auth/login.js'
import { registerAuthMe } from './auth/me.js'
import { registerAuthLogout } from './auth/logout.js'
import type { DemoAuthService } from '../modules/auth/auth.service.js'
import { registerHealthRoute } from './health/index.js'
import { registerProjectsRoot } from './projects/index.js'
import { registerProjectEstimate } from './projects/estimate.js'

/** The only HTTP route registry. Nested index.ts files are route endpoints. */
export function registerRoutes(app: FastifyInstance, config: BackendConfig, auth: DemoAuthService | undefined, state: RuntimeStore): void {
    registerHealthRoute(app, config)
    registerAuthRoot(app, auth)
    registerAuthLogin(app, config, auth)
    registerAuthMe(app, auth)
    registerAuthLogout(app, config, auth)
    registerProjectsRoot(app)
    registerProjectEstimate(app, state)
}
