import { resolve } from 'node:path'
import type { BackendConfig } from '../../config.js'
import { FileSessionStore } from '../../db/FileSessionStore.js'
import { DemoAuthService } from './auth.service.js'

/** Demo provider is disabled by default and blocked in production by readConfig(). */
export function createAuthService(config: BackendConfig): DemoAuthService | undefined {
    if (config.AUTH_MODE !== 'demo') return undefined

    const sessionFile = config.AUTH_FILE_PATH ?? resolve(process.cwd(), 'storage', 'auth', 'sessions.json')
    return new DemoAuthService(config.AUTH_USERNAME!, config.AUTH_PASSWORD_HASH!, new FileSessionStore(sessionFile))
}
