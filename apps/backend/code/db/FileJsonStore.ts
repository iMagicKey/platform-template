import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ZodType } from 'zod'

/**
 * Minimal single-process file storage for examples, not a multi-writer database.
 * Every mutation in this instance is serialized, validated and atomically renamed.
 * A corrupt file fails loudly; only a missing file starts with an empty snapshot.
 */
export class FileJsonStore<T> {
    private pending: Promise<void> = Promise.resolve()

    constructor(
        private readonly path: string,
        private readonly schema: ZodType<T>,
        private readonly initial: () => T
    ) {}

    private async readRaw(): Promise<T> {
        try {
            return this.schema.parse(JSON.parse(await readFile(this.path, 'utf8')))
        } catch (error) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
                return this.schema.parse(this.initial())
            }
            throw error
        }
    }

    async read(): Promise<T> {
        await this.pending
        return this.readRaw()
    }

    async update<R>(change: (snapshot: T) => { value: T; result: R }): Promise<R> {
        const operation = this.pending.then(async () => {
            const current = structuredClone(await this.readRaw())
            const { value, result } = change(current)
            const validated = this.schema.parse(value)
            const folder = dirname(this.path)
            await mkdir(folder, { recursive: true, mode: 0o700 })
            const temp = join(folder, '.' + randomUUID() + '.tmp')
            try {
                await writeFile(temp, JSON.stringify(validated, null, 4) + '\n', { mode: 0o600, flag: 'wx' })
                await rename(temp, this.path)
            } finally {
                await rm(temp, { force: true })
            }
            return result
        })
        this.pending = operation.then(
            () => undefined,
            () => undefined
        )
        return operation
    }
}
