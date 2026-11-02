import type { FastifyInstance } from 'fastify'
import type { ApiConfig } from '../config.js'
import { registerHealth } from './health/index.js'
import { registerPing } from './v1/ping.js'

export function registerRoutes(app: FastifyInstance, config: ApiConfig) {
    registerHealth(app, config)
    registerPing(app)
}
