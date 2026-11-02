export type ServiceDefinition = {
    id: string
    name: string
    role: string
    category: 'http' | 'automation'
    port: string
    path: string
    description: string
    technology: string
    accent: string
}

export const SERVICES: ServiceDefinition[] = [
    {
        id: 'web',
        name: 'Web',
        role: 'Frontend',
        category: 'http',
        port: '3000',
        path: '/',
        description: 'App Router, Server Components and native Next.js runtime.',
        technology: 'Next.js',
        accent: 'sky',
    },
    {
        id: 'backend',
        name: 'Backend',
        role: 'HTTP + WebSocket',
        category: 'http',
        port: '3100',
        path: '/api/health',
        description: 'Fastify API, Zod validation, JWT primitives and WebSocket transport.',
        technology: 'Fastify',
        accent: 'violet',
    },
    {
        id: 'api',
        name: 'Public API',
        role: 'Independent API',
        category: 'http',
        port: '3200',
        path: '/v1/ping',
        description: 'Versioned endpoints with generated OpenAPI and Swagger UI.',
        technology: 'Fastify',
        accent: 'emerald',
    },
    {
        id: 'worker',
        name: 'Worker',
        role: 'Background tasks',
        category: 'automation',
        port: '—',
        path: 'No HTTP endpoint',
        description: 'Independent scheduler process using the published iMagic Scheduler.',
        technology: 'iMagic Scheduler',
        accent: 'amber',
    },
    {
        id: 'bot',
        name: 'Telegram bot',
        role: 'Messaging',
        category: 'automation',
        port: '—',
        path: 'No HTTP endpoint',
        description: 'grammY long polling. Disabled until BOT_ENABLED and BOT_TOKEN are set.',
        technology: 'grammY',
        accent: 'pink',
    },
]
