import { timingSafeEqual } from 'node:crypto'
import { sendError } from '@platform/api-contract'
import type { FastifyInstance } from 'fastify'
import type { BackendConfig } from '../config.js'
import { z } from 'zod'
import type { RuntimeStore } from '../store.js'

const messageSchema = z.object({ type: z.literal('ping') })

function constantTimeEqual(left: string, right: string): boolean {
    const a = Buffer.from(left)
    const b = Buffer.from(right)
    return a.length === b.length && timingSafeEqual(a, b)
}

export function registerWebsocket(app: FastifyInstance, config: BackendConfig, state: RuntimeStore): void {
    const clients = new Set<{ close: (code: number, reason: string) => void; terminate: () => void }>()
    app.get(
        '/ws',
        {
            websocket: true,
            preValidation: async (request, reply) => {
                const origin = request.headers.origin
                const protocols = String(request.headers['sec-websocket-protocol'] ?? '')
                    .split(',')
                    .map((x) => x.trim())
                const ticket = protocols.find((value) => value.startsWith('ticket.'))?.slice(7)
                if (!origin || !config.WS_ALLOWED_ORIGINS.includes(origin)) {
                    return reply.code(403).send(sendError('ORIGIN_NOT_ALLOWED', 'WebSocket origin is not allowed'))
                }
                if (!config.WS_DEMO_TOKEN || !ticket || !constantTimeEqual(ticket, config.WS_DEMO_TOKEN)) {
                    return reply.code(401).send(sendError('UNAUTHENTICATED', 'WebSocket authentication required'))
                }
            },
        },
        (socket) => {
            clients.add(socket)
            // WebSocket is the sole writer of connection state. Simple direct assignment.
            state.activeConnections = clients.size
            let alive = true
            socket.on('pong', () => {
                alive = true
            })
            const heartbeat = setInterval(() => {
                if (!alive) {
                    socket.terminate()
                    return
                }
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
            socket.on('close', () => {
                clearInterval(heartbeat)
                clients.delete(socket)
                state.activeConnections = clients.size
            })
            socket.on('error', (error: unknown) => app.log.warn({ err: error }, 'WebSocket connection error'))
        }
    )
}
