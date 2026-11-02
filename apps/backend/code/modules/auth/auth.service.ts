import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { SessionStore } from '../../db/client.js'
import type { UserSession } from '../../db/models/UserSession.js'

const derive = promisify(scrypt)
const SESSION_SECONDS = 8 * 60 * 60

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16)
    const hash = (await derive(password, salt, 64)) as Buffer
    return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex')
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

/** Development-only single-user identity provider with an injectable session repository. */
export class DemoAuthService {
    constructor(
        private readonly username: string,
        private readonly passwordHash: string,
        private readonly sessions: SessionStore
    ) {}

    async authenticate(username: string, password: string): Promise<boolean> {
        // Keep a hash calculation even on an unknown username to reduce timing leaks.
        const validPassword = await verifyPassword(password, this.passwordHash)
        const given = Buffer.from(username)
        const expected = Buffer.from(this.username)
        return given.length === expected.length && timingSafeEqual(given, expected) && validPassword
    }

    async createSession(): Promise<{ token: string; session: UserSession }> {
        const token = randomBytes(32).toString('base64url')
        const session = { userId: this.username, expiresAt: Date.now() + SESSION_SECONDS * 1000 }
        await this.sessions.save(tokenKey(token), session)
        return { token, session }
    }

    async getSession(token: string | undefined): Promise<UserSession | undefined> {
        return token ? this.sessions.find(tokenKey(token)) : undefined
    }

    async revoke(token: string | undefined): Promise<void> {
        if (token) await this.sessions.remove(tokenKey(token))
    }
}

export const DEMO_SESSION_SECONDS = SESSION_SECONDS
export const demoCookieName = 'dev-session'
