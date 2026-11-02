import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, truncateSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const [action, name] = process.argv.slice(2)
if (!['clear', 'show'].includes(action) || !name || !/^[a-z0-9-]+$/.test(name)) {
    process.stderr.write('Usage: pnpm system:logs <clear|show> <app-name>\n')
    process.exit(2)
}
const app = join(root, 'apps', name)
if (!existsSync(join(app, 'package.json'))) throw new Error('Unknown app')
if (action === 'show') {
    const result = spawnSync('journalctl', ['-u', `platform-${name}`, '-n', '100', '--no-pager'], { stdio: 'inherit' })
    process.exitCode = result.status ?? 1
} else {
    const dir = join(app, 'logs')
    if (!existsSync(dir)) process.stdout.write('No file logs to clear\n')
    else {
        for (const item of readdirSync(dir, { withFileTypes: true })) {
            if (item.isFile() && /\.log(?:\.\d+)?$/.test(item.name)) truncateSync(join(dir, item.name))
        }
        process.stdout.write(`Cleared local .log files for ${name}; journald is unchanged\n`)
    }
}
