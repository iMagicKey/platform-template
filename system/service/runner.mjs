import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const appName = process.argv[2]
if (!appName || !/^[a-z0-9-]+$/.test(appName)) process.exit(2)
const root = resolve(import.meta.dirname, '../..')
const child = spawn('corepack', ['pnpm', '--filter', `@platform/${appName}`, 'start'], {
    cwd: root, stdio: 'inherit', env: process.env,
})
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal))
child.on('error', (error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0) })
