import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import type { BackendConfig } from '../config.js'
import { z } from 'zod'

const messageSchema = z.object({ type: z.literal('ping') })

function constantTimeEqual(left: string, right: string): boolean {
    const a = Buffer.from(left)
    const b = Buffer.from(right)
    return a.length === b.length && timingSafeEqual(a, b)
}

export function registerWebsocket(app: FastifyInstance, config: BackendConfig): void {
    const clients = new Set<{ close: (code: number, reason: string) => void; terminate: () => void }>()
    app.get('/ws', {
        websocket: true,
        preValidation: async (request, reply) => {
            const origin = request.headers.origin
            const protocols = String(request.headers['sec-websocket-protocol'] ?? '').split(',').map((x) => x.trim())
            const ticket = protocols.find((value) => value.startsWith('ticket.'))?.slice(7)
            if (!config.WS_DEMO_TOKEN || !origin || !config.WS_ALLOWED_ORIGINS.includes(origin) ||
                !ticket || !constantTimeEqual(ticket, config.WS_DEMO_TOKEN)) {
                return reply.code(401).send({ error: 'UNAUTHORIZED' })
            }
        },
    }, (socket) => {
        clients.add(socket)
        let alive = true
        socket.on('pong', () => { alive = true })
        const heartbeat = setInterval(() => {
            if (!alive) { socket.terminate(); return }
            alive = false
            socket.ping()
        }, 30_000)
        socket.on('message', (raw: unknown) => {
            try {
                const message = messageSchema.parse(JSON.parse(String(raw)))
                if (message.type === 'ping') socket.send(JSON.stringify({ type: 'pong' }))
            } catch {
                socket.send(JSON.stringify({ error: 'INVALID_MESSAGE' }))
            }
        })
        socket.on('close', () => { clearInterval(heartbeat); clients.delete(socket) })
        socket.on('error', (error: unknown) => app.log.warn({ err: error }, 'WebSocket connection error'))
    })
    app.addHook('onClose', async () => {
        for (const socket of clients) socket.close(1001, 'Server shutdown')
        // A bounded shutdown; never block process exit on stale sockets.
        await new Promise((resolve) => setTimeout(resolve, 200))
        for (const socket of clients) socket.terminate()
    })
}
