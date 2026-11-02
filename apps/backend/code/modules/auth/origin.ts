export function requireAllowedOrigin(origin: string | undefined, allowed: readonly string[]): boolean {
    return Boolean(origin && allowed.includes(origin))
}
