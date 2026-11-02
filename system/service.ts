import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const [action = '', name = '', ...args] = process.argv.slice(2)
const apply = args.includes('--apply')
const userIndex = args.indexOf('--user')
const user = userIndex >= 0 ? args[userIndex + 1] : undefined

if (!['install', 'uninstall'].includes(action) || !name || !/^[a-z0-9-]+$/.test(name)) {
    process.stderr.write('Usage: pnpm system:service <install|uninstall> <app-name> [--user <non-root-user>] [--apply]\n')
    process.exit(2)
}
if (action === 'install' && (!user || !/^[a-z_][a-z0-9_-]*$/.test(user) || user === 'root')) {
    throw new Error('Installation requires --user <non-root-service-account>; root is prohibited')
}
const path = join(root, 'apps', name, 'package.json')
if (!existsSync(path)) throw new Error('Unknown app')
const pkg = JSON.parse(readFileSync(path, 'utf8'))
if (!pkg.scripts?.start || !pkg.scripts?.build) throw new Error('App must declare build and start scripts')

const unitName = `platform-${name}.service`
const destination = `/etc/systemd/system/${unitName}`
const runtime = process.env.PLATFORM_RUNTIME_DIR ? resolve(process.env.PLATFORM_RUNTIME_DIR) : join(root, 'runtime')
const draft = join(runtime, 'deploy', 'systemd', unitName)

if (action === 'install') {
    if (apply && (root.startsWith('/home/') || root.startsWith('/root/'))) {
        throw new Error('Deploy outside /home and /root because ProtectHome=true restricts those paths')
    }
    const pnpmExecutable = execFileSync('which', ['pnpm'], { encoding: 'utf8' }).trim()
    if (!pnpmExecutable.startsWith('/')) throw new Error('Could not locate absolute pnpm executable')
    const nodePath = dirname(process.execPath)
    const unit = `[Unit]
Description=Platform ${name}
After=network.target

[Service]
Type=simple
User=${user}
WorkingDirectory=${root}
Environment=NODE_ENV=production
Environment=PATH=${nodePath}:/usr/local/bin:/usr/bin:/bin
ExecStart=${pnpmExecutable} --filter @platform/${name} start
Restart=on-failure
RestartSec=5
TimeoutStopSec=15
KillSignal=SIGTERM
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=-${join(root, 'apps', name, 'storage')} -${join(root, 'apps', name, 'logs')}
StandardOutput=journal
StandardError=journal
SyslogIdentifier=platform-${name}

[Install]
WantedBy=multi-user.target
`
    mkdirSync(dirname(draft), { recursive: true })
    writeFileSync(draft, unit)
    process.stdout.write(`Generated ${draft}\n`)
    if (apply) {
        execFileSync('id', ['-u', user!], { stdio: 'ignore' })
        execFileSync('install', ['-m', '644', draft, destination], { stdio: 'inherit' })
        execFileSync('systemctl', ['daemon-reload'])
        execFileSync('systemctl', ['enable', '--now', unitName], { stdio: 'inherit' })
    } else process.stdout.write('Dry run: review the generated unit and pass --apply to install\n')
} else {
    if (apply) {
        execFileSync('systemctl', ['disable', '--now', unitName], { stdio: 'inherit' })
        execFileSync('rm', ['-f', destination])
        execFileSync('systemctl', ['daemon-reload'])
    } else process.stdout.write(`Dry run: would remove ${destination}\n`)
}
