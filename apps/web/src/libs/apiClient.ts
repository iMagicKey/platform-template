import type { ApiIssue, ApiSuccess } from '@platform/api-contract'

export class ApiRequestError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string,
        readonly issues?: ApiIssue[]
    ) {
        super(message)
        this.name = 'ApiRequestError'
    }
}

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Validate the shared envelope at the browser boundary; T is validated by each endpoint consumer. */
export async function readApiResponse<T>(response: Response): Promise<ApiSuccess<T>> {
    let raw: unknown
    try {
        raw = (await response.json()) as unknown
    } catch {
        throw new Error('Backend returned an invalid JSON response')
    }

    if (!record(raw) || !('data' in raw) || !('error' in raw)) throw new Error('Invalid API response envelope')

    if (raw.error === null && response.ok) return { data: raw.data as T, error: null }

    if (raw.data !== null || !record(raw.error) || typeof raw.error.code !== 'string' || typeof raw.error.message !== 'string') {
        throw new Error('Invalid API response envelope')
    }
    if (response.ok) throw new Error('Successful HTTP response cannot contain an API error')

    let issues: ApiIssue[] | undefined
    if ('issues' in raw.error && raw.error.issues !== undefined) {
        if (
            !Array.isArray(raw.error.issues) ||
            !raw.error.issues.every(
                (issue: unknown) =>
                    record(issue) &&
                    Array.isArray(issue.path) &&
                    issue.path.every((segment) => typeof segment === 'string' || typeof segment === 'number') &&
                    typeof issue.code === 'string' &&
                    typeof issue.message === 'string'
            )
        ) {
            throw new Error('Invalid API error issues')
        }
        issues = raw.error.issues as ApiIssue[]
    }

    throw new ApiRequestError(response.status, raw.error.code, raw.error.message, issues)
}

export async function requestApi<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers)
    if (options.body !== undefined && options.body !== null && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }
    const response = await fetch(url, {
        ...options,
        cache: 'no-store',
        credentials: 'same-origin',
        headers,
    })
    const envelope = await readApiResponse<T>(response)
    return envelope.data
}
