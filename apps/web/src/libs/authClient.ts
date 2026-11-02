import { ApiRequestError, requestApi } from './apiClient'

export type CurrentUser = { id: string }

function readUser(value: unknown): CurrentUser | null {
    if (!value || typeof value !== 'object' || !('user' in value)) return null
    const user = value.user
    if (!user || typeof user !== 'object' || !('id' in user) || typeof user.id !== 'string') return null
    return { id: user.id }
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    return requestApi<T>(`/api/auth${path}`, options)
}

export async function getAuthConfiguration(): Promise<boolean> {
    let data: { configured: boolean }
    try {
        data = await authRequest<{ configured: boolean }>('')
    } catch {
        throw new Error('Backend unavailable. Open the site through Caddy on port 8080.')
    }
    if (typeof data?.configured !== 'boolean') throw new Error('Invalid authentication configuration response')
    return data.configured
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        const data = await authRequest<unknown>('/me')
        const user = readUser(data)
        if (!user) throw new Error('Invalid authentication response')
        return user
    } catch (cause) {
        if (cause instanceof ApiRequestError && cause.status === 401) return null
        throw cause
    }
}

export async function loginUser(login: string, password: string): Promise<CurrentUser> {
    let data: unknown
    try {
        data = await authRequest<unknown>('/login', {
            method: 'POST',
            body: JSON.stringify({ login, password }),
        })
    } catch (cause) {
        if (cause instanceof ApiRequestError) {
            if (cause.code === 'INVALID_CREDENTIALS') throw new Error('Invalid login or password')
            if (cause.code === 'ORIGIN_NOT_ALLOWED') throw new Error('Origin is not permitted; check AUTH_ALLOWED_ORIGINS')
        }
        throw cause
    }
    const user = readUser(data)
    if (!user) throw new Error('Invalid authentication response')
    return user
}

export async function logoutUser(): Promise<void> {
    const result = await authRequest<null>('/logout', { method: 'POST' })
    if (result !== null) throw new Error('Invalid logout response')
}
