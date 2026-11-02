import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCommitSubject } from './commit.ts'

test('accepts conventional subjects and breaking-change notation', () => {
    for (const message of [
        'feat(web): add dashboard filters',
        'fix: resolve unhandled shutdown',
        'docs(architecture): clarify database naming',
        'feat(api)!: replace response contract\\n\\nBREAKING CHANGE: clients must upgrade',
        'ci: verify commit subjects',
    ]) {
        assert.deepEqual(validateCommitSubject(message), [], message)
    }
})

test('rejects malformed commit subjects', () => {
    for (const message of [
        'updated the code',
        'Feature(web): add functionality',
        'feat(WEB): add functionality',
        'fix(web): Fix the bug',
        'feat(web): add feature.',
        'chore: ' + 'a'.repeat(75),
        'cleanup: move files',
    ]) {
        assert.notDeepEqual(validateCommitSubject(message), [], message)
    }
})
