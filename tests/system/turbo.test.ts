import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('web build cache key includes the gitignored env files Next.js compiles into the bundle', () => {
    const { tasks } = JSON.parse(readFileSync(new URL('../../turbo.json', import.meta.url), 'utf8'))
    // Turbo hashes only non-ignored files by default, so a changed NEXT_PUBLIC_RELEASE would replay a stale build.
    const inputs: string[] = tasks['@platform/web#build'].inputs
    assert.ok(inputs.includes('$TURBO_DEFAULT$'))
    assert.ok(inputs.includes('.env*'))
})
