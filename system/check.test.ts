import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const checker = resolve(import.meta.dirname, 'check.ts')
const scripts = { dev: 'true', build: 'true', start: 'true', test: 'true', typecheck: 'true', lint: 'true' }

test('architecture checker catches filename, route and cross-boundary violations', () => {
    const root = mkdtempSync(join(tmpdir(), 'platform-arch-'))
    function add(path: string, content: string): void {
        const full = join(root, path)
        mkdirSync(resolve(full, '..'), { recursive: true })
        writeFileSync(full, content)
    }
    try {
        add('docs/ARCHITECTURE.md', 'baseline')
        for (const app of ['web', 'backend', 'api']) {
            add(`apps/${app}/package.json`, JSON.stringify({ name: `@platform/${app}`, scripts }))
            add(`apps/${app}/AGENTS.md`, 'local')
        }
        add('apps/backend/code/routes/index.ts', '// registry')
        add('apps/api/code/routes/index.ts', '// registry')
        add('apps/backend/code/routes/a.ts', "app.get('/a', () => {})")
        assert.equal(spawnSync(process.execPath, [checker, root], { encoding: 'utf8' }).status, 0)
        add('apps/web/src/components/lower_case_component.tsx', 'export const x = 1')
        add('apps/web/src/hooks/notAHook.ts', 'export const x = 1')
        add('apps/backend/code/routes/BadSegment/Bad_Route.ts', 'export {}')
        add('apps/backend/code/routes/b.ts', "app.get('/a', () => {})")
        add('apps/backend/code/foreign.ts', "import '../../api/code/config.js'; void import('../../api/code/config.js')")
        add('packages/shared/code/leak.ts', "export { value } from '../../../apps/backend/code/config.js'")
        const run = spawnSync(process.execPath, [checker, root], { encoding: 'utf8' })
        assert.equal(run.status, 1)
        for (const expected of ['Expected PascalCase', 'Expected useHook', 'Invalid lowercase', 'Duplicate HTTP route', 'Cross-app source import', 'Shared package imports']) {
            assert.match(run.stderr, new RegExp(expected))
        }
    } finally {
        rmSync(root, { recursive: true, force: true })
    }
})
