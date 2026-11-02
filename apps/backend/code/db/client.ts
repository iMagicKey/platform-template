// An adapter contract, deliberately not an active database connection.
// Select Prisma, Drizzle or another driver per consuming application.
export interface DatabaseClient {
    connect(): Promise<void>
    ping(): Promise<boolean>
    close(): Promise<void>
}

import type { UserSession } from './models/UserSession.js'

/** Replaceable boundary for development sessions and future database integrations. */
export interface SessionStore {
    find(tokenHash: string): Promise<UserSession | undefined>
    save(tokenHash: string, session: UserSession): Promise<void>
    remove(tokenHash: string): Promise<void>
}
