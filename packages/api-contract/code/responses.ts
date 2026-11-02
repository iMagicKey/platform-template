import type { ApiError, ApiFailure, ApiIssue, ApiSuccess } from './types.js'

/** Shapes a successful HTTP response; does not send it or choose its status. */
export function sendData<T>(data: T): ApiSuccess<T> {
    return { data, error: null }
}

/** Shapes a failed HTTP response; the route or error handler chooses its status. */
export function sendError<const Code extends string>(code: Code, message: string, issues?: ApiIssue[]): ApiFailure<Code> {
    const error: ApiError<Code> = { code, message }
    if (issues !== undefined) error.issues = issues
    return { data: null, error }
}
