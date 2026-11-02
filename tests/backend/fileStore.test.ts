import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { z } from 'zod'
import { FileJsonStore } from '../../apps/backend/code/db/FileJsonStore.js'
import { FileSessionStore } from '../../apps/backend/code/db/FileSessionStore.js'

test('file adapter serializes concurrent writes and retains data across instances', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-json-'))
    const file = join(dir, 'nested', 'counter.json')
    const schema = z.object({ count: z.number().int().min(0) })
    try {
        const first = new FileJsonStore(file, schema, () => ({ count: 0 }))
        await Promise.all(Array.from({ length: 20 }, () => first.update((value) => ({ value: { count: value.count + 1 }, result: undefined }))))
        const second = new FileJsonStore(file, schema, () => ({ count: 0 }))
        assert.equal((await second.read()).count, 20)
        assert.equal((await stat(file)).mode & 0o777, process.platform === 'win32' ? (await stat(file)).mode & 0o777 : 0o600)
        const parsed = JSON.parse(await readFile(file, 'utf8')) as unknown
        assert.deepEqual(schema.parse(parsed), { count: 20 })
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
})

test('file adapter rejects corrupt JSON instead of silently resetting it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-json-'))
    const file = join(dir, 'broken.json')
    try {
        await writeFile(file, 'not-json')
        const store = new FileJsonStore(file, z.object({ count: z.number() }), () => ({ count: 0 }))
        await assert.rejects(() => store.read(), SyntaxError)
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
})

test('file session store rejects expired sessions and persists only hashes', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-session-'))
    const file = join(dir, 'sessions.json')
    const key = 'a'.repeat(64)
    try {
        const store = new FileSessionStore(file)
        await store.save(key, { userId: 'user-1', expiresAt: Date.now() + 60_000 })
        assert.equal((await store.find(key))?.userId, 'user-1')
        assert.ok((await readFile(file, 'utf8')).includes(key))
        await store.remove(key)
        assert.equal(await store.find(key), undefined)
        await store.save(key, { userId: 'user-1', expiresAt: Date.now() - 1 })
        assert.equal(await store.find(key), undefined)
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
})
