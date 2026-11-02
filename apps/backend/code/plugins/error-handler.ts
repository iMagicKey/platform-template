import type { FastifyInstance } from 'fastify'
import { sendError, type ApiIssue } from '@platform/api-contract'

function validationIssues(value: unknown): ApiIssue[] {
    if (!Array.isArray(value)) return []

    return value.map((entry: unknown) => {
        const item = entry as {
            instancePath?: string
            keyword?: string
            message?: string
            params?: { issue?: { path?: (string | number)[]; code?: string; message?: string } }
        }
        const zodIssue = item.params?.issue
        const pointer = item.instancePath ?? ''
        const path = Array.isArray(zodIssue?.path)
            ? zodIssue.path
            : pointer
                  .split('/')
                  .filter(Boolean)
                  .map((part) => {
                      const decoded = part.replaceAll('~1', '/').replaceAll('~0', '~')
                      return /^(0|[1-9][0-9]*)$/.test(decoded) ? Number(decoded) : decoded
                  })

        return {
            path,
            code: zodIssue?.code ?? item.keyword ?? 'invalid',
            message: zodIssue?.message ?? item.message ?? 'Invalid value',
        }
    })
}

const clientErrors: Record<number, { code: string; message: string }> = {
    400: { code: 'BAD_REQUEST', message: 'Invalid request' },
    401: { code: 'UNAUTHENTICATED', message: 'Authentication is required' },
    403: { code: 'FORBIDDEN', message: 'Access denied' },
    404: { code: 'NOT_FOUND', message: 'Resource not found' },
    409: { code: 'CONFLICT', message: 'Request conflicts with current state' },
    413: { code: 'PAYLOAD_TOO_LARGE', message: 'Request payload is too large' },
    415: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Unsupported content type' },
    422: { code: 'UNPROCESSABLE_ENTITY', message: 'Request could not be processed' },
    429: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
}

export function registerErrorHandlers(app: FastifyInstance): void {
    app.setNotFoundHandler((_request, reply) => {
        return reply.code(404).send(sendError('NOT_FOUND', 'Route not found'))
    })

    app.setErrorHandler((error, request, reply) => {
        const failure = error as { validation?: unknown; statusCode?: number }
        if (failure.validation) {
            return reply.code(400).send(sendError('VALIDATION_ERROR', 'Request validation failed', validationIssues(failure.validation)))
        }

        const status = failure.statusCode && failure.statusCode >= 400 && failure.statusCode < 600 ? failure.statusCode : 500
        if (status >= 500) {
            app.log.error({ err: error, requestId: request.id }, 'Unhandled HTTP error')
            return reply.code(status).send(sendError('INTERNAL_SERVER_ERROR', 'An unexpected server error occurred'))
        }

        const clientError = clientErrors[status] ?? { code: 'REQUEST_FAILED', message: 'Request failed' }
        return reply.code(status).send(sendError(clientError.code, clientError.message))
    })
}
