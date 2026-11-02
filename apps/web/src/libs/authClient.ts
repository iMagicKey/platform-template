export type CurrentUser = { id: string }

async function parseJson(response: Response): Promise<unknown> {
    try {
        return (await response.json()) as unknown
    } catch {
        return null
    }
}

function readUser(data: unknown): CurrentUser | null {
    if (!data || typeof data !== 'object' || !('user' in data)) return null
    const user = data.user
    if (!user || typeof user !== 'object' || !('id' in user) || typeof user.id !== 'string') return null
    return { id: user.id }
}

async function authRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`/api/auth${path}`, {
        ...options,
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...options.headers },
    })
    return { response, data: await parseJson(response) }
}

export async function getAuthConfiguration(): Promise<boolean> {
    const { response, data } = await authRequest('')
    if (!response.ok || !data || typeof data !== 'object' || !('configured' in data) || typeof data.configured !== 'boolean') {
        throw new Error('Backend unavailable. Open the site through Caddy on port 8080.')
    }
    return data.configured
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const { response, data } = await authRequest('/me')
    if (response.status === 401) return null
    if (!response.ok) throw new Error('Unable to check the current session')
    return readUser(data)
}

export async function loginUser(login: string, password: string): Promise<CurrentUser> {
    const { response, data } = await authRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
    })
    if (response.status === 401) throw new Error('Invalid login or password')
    if (response.status === 403) throw new Error('Origin is not permitted; check AUTH_ALLOWED_ORIGINS')
    if (!response.ok) throw new Error('Authentication is unavailable')
    const user = readUser(data)
    if (!user) throw new Error('Invalid authentication response')
    return user
}

export async function logoutUser(): Promise<void> {
    const { response } = await authRequest('/logout', { method: 'POST' })
    if (!response.ok) throw new Error('Unable to log out')
}
