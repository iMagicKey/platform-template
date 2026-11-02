export class AuthenticationUnavailableError extends Error {
    constructor() {
        super('Authentication is not configured. Install a real identity provider before enabling login.')
        this.name = 'AuthenticationUnavailableError'
    }
}

export async function login(): Promise<never> {
    throw new AuthenticationUnavailableError()
}
