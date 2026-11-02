/** HTTP JSON envelopes only; domain services return plain values. */
export type ApiIssue = {
    path: (string | number)[]
    code: string
    message: string
}

export type ApiError<Code extends string = string> = {
    code: Code
    message: string
    issues?: ApiIssue[]
}

export type ApiSuccess<T> = { data: T; error: null }
export type ApiFailure<Code extends string = string> = { data: null; error: ApiError<Code> }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure
