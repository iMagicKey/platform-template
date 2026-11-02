import { z } from 'zod'
import { FileJsonStore } from './FileJsonStore.js'
import { userSessionSchema, type UserSession } from './models/UserSession.js'
import type { SessionStore } from './client.js'

const storageSchema = z.object({
    sessions: z.record(z.string().regex(/^[0-9a-f]{64}$/), userSessionSchema),
})

/** Development example: one writer per file; no cross-process locking or replication. */
export class FileSessionStore implements SessionStore {
    private readonly file: FileJsonStore<z.infer<typeof storageSchema>>

    constructor(path: string) {
        this.file = new FileJsonStore(path, storageSchema, () => ({ sessions: {} }))
    }

    async find(tokenHash: string): Promise<UserSession | undefined> {
        const { sessions } = await this.file.read()
        const session = sessions[tokenHash]
        return session && session.expiresAt > Date.now() ? session : undefined
    }

    async save(tokenHash: string, session: UserSession): Promise<void> {
        await this.file.update((data) => {
            const now = Date.now()
            for (const [key, existing] of Object.entries(data.sessions)) {
                if (existing.expiresAt <= now) delete data.sessions[key]
            }
            if (Object.keys(data.sessions).length >= 1000) throw new Error('Demo session capacity reached')
            data.sessions[tokenHash] = session
            return { value: data, result: undefined }
        })
    }

    async remove(tokenHash: string): Promise<void> {
        await this.file.update((data) => {
            delete data.sessions[tokenHash]
            return { value: data, result: undefined }
        })
    }
}
