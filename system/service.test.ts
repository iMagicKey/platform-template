import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const cli = resolve(import.meta.dirname, 'service.ts')

test('systemd service generator requires non-root account and applies sandboxing', () => {
    const runtime = mkdtempSync(join(tmpdir(), 'platform-systemd-'))
    const env = { ...process.env, PLATFORM_RUNTIME_DIR: runtime }
    try {
        const rootUser = spawnSync(process.execPath, [cli, 'install', 'backend', '--user', 'root'], { env, encoding: 'utf8' })
        assert.notEqual(rootUser.status, 0)
        assert.match(rootUser.stderr, /root is prohibited/)

        const generated = spawnSync(process.execPath, [cli, 'install', 'backend', '--user', 'platform'], { env, encoding: 'utf8' })
        assert.equal(generated.status, 0, generated.stderr)
        const unit = readFileSync(join(runtime, 'deploy', 'systemd', 'platform-backend.service'), 'utf8')
        assert.match(unit, /^User=platform$/m)
        assert.match(unit, /^NoNewPrivileges=true$/m)
        assert.match(unit, /^ProtectSystem=strict$/m)
        assert.match(unit, /^ProtectHome=true$/m)
        assert.match(unit, /^PrivateTmp=true$/m)
        assert.match(unit, /^ReadWritePaths=/m)
        assert.match(unit, /^Environment=PATH=/m)
        assert.match(unit, /^Environment=NODE_ENV=production$/m)
    } finally {
        rmSync(runtime, { recursive: true, force: true })
    }
})
