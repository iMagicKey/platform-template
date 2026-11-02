import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const derive = promisify(scrypt)
const SESSION_SECONDS = 8 * 60 * 60
const MAX_SESSIONS = 1000

export type Session = { userId: string; expiresAt: number }

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16)
    const hash = (await derive(password, salt, 64)) as Buffer
    return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [, hexSalt, hexHash] = stored.split('$')
    if (!hexSalt || !hexHash) return false
    const expected = Buffer.from(hexHash, 'hex')
    const actual = (await derive(password, Buffer.from(hexSalt, 'hex'), expected.length)) as Buffer
    return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function tokenKey(token: string): string {
    return createHash('sha256').update(token).digest('hex')
}

/**
 * Working development-only identity/session provider. Sessions expire, are revocable
 * and never expose their stored hashes as browser-readable values.
 * Replace with a persistent adapter before deploying authentication to production.
 */
export class DemoAuthService {
    private readonly sessions = new Map<string, Session>()

    constructor(private readonly username: string, private readonly passwordHash: string) {}

    async authenticate(username: string, password: string): Promise<boolean> {
        // Keep a hash calculation even on an unknown username to avoid an obvious timing oracle.
        const validPassword = await verifyPassword(password, this.passwordHash)
        const given = Buffer.from(username)
        const expected = Buffer.from(this.username)
        return given.length === expected.length && timingSafeEqual(given, expected) && validPassword
    }

    createSession(): { token: string; session: Session } {
        const now = Date.now()
        for (const [key, value] of this.sessions) {
            if (value.expiresAt <= now) this.sessions.delete(key)
        }
        if (this.sessions.size >= MAX_SESSIONS) throw new Error('Demo session capacity reached')
        const token = randomBytes(32).toString('base64url')
        const session = { userId: this.username, expiresAt: now + SESSION_SECONDS * 1000 }
        this.sessions.set(tokenKey(token), session)
        return { token, session }
    }

    getSession(token: string | undefined): Session | undefined {
        if (!token) return undefined
        const key = tokenKey(token)
        const session = this.sessions.get(key)
        if (session && session.expiresAt > Date.now()) return session
        this.sessions.delete(key)
        return undefined
    }

    revoke(token: string | undefined): void {
        if (token) this.sessions.delete(tokenKey(token))
    }

    close(): void {
        this.sessions.clear()
    }
}

export const DEMO_SESSION_SECONDS = SESSION_SECONDS
export const demoCookieName = 'dev-session'
