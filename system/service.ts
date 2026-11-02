import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const [action, name, flag] = process.argv.slice(2)
if (!['install', 'uninstall'].includes(action) || !name || !/^[a-z0-9-]+$/.test(name)) {
    process.stderr.write('Usage: pnpm system:service <install|uninstall> <app-name> [--apply]\n')
    process.exit(2)
}
const path = join(root, 'apps', name, 'package.json')
if (!existsSync(path)) throw new Error('Unknown app')
const pkg = JSON.parse(readFileSync(path, 'utf8'))
if (!pkg.scripts?.start || !pkg.scripts?.build) throw new Error('App must declare build and start scripts')

const pnpmExecutable = execFileSync('which', ['pnpm'], { encoding: 'utf8' }).trim()
if (!pnpmExecutable.startsWith('/')) throw new Error('Could not locate absolute pnpm executable')
const unitName = `platform-${name}.service`
const unit = `[Unit]
Description=Platform ${name}
After=network.target

[Service]
Type=simple
WorkingDirectory=${root}
Environment=NODE_ENV=production
ExecStart=${pnpmExecutable} --filter @platform/${name} start
Restart=on-failure
RestartSec=5
TimeoutStopSec=15
KillSignal=SIGTERM
StandardOutput=journal
StandardError=journal
SyslogIdentifier=platform-${name}

[Install]
WantedBy=multi-user.target
`
const destination = `/etc/systemd/system/${unitName}`
const runtime = process.env.PLATFORM_RUNTIME_DIR ? resolve(process.env.PLATFORM_RUNTIME_DIR) : join(root, 'runtime')
const draft = join(runtime, 'deploy', 'systemd', unitName)
if (action === 'install') {
    mkdirSync(join(runtime, 'deploy', 'systemd'), { recursive: true })
    writeFileSync(draft, unit)
    process.stdout.write(`Generated ${draft}\n`)
    if (flag === '--apply') {
        execFileSync('install', ['-m', '644', draft, destination], { stdio: 'inherit' })
        execFileSync('systemctl', ['daemon-reload'])
        execFileSync('systemctl', ['enable', '--now', unitName], { stdio: 'inherit' })
    } else process.stdout.write('Dry run: review the generated unit and pass --apply to install\n')
} else {
    if (flag === '--apply') {
        execFileSync('systemctl', ['disable', '--now', unitName], { stdio: 'inherit' })
        execFileSync('rm', ['-f', destination])
        execFileSync('systemctl', ['daemon-reload'])
    } else process.stdout.write(`Dry run: would remove ${destination}\n`)
}
