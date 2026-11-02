import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const [action, service, hostname = 'localhost'] = process.argv.slice(2)
if (action !== 'self-signed' || !service || !/^[a-z0-9][a-z0-9-]*$/.test(service)) {
    process.stderr.write('Usage: pnpm system:certs self-signed <service> [hostname]\n')
    process.exit(2)
}
if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) throw new Error('Invalid hostname')
const runtime = process.env.PLATFORM_RUNTIME_DIR ? resolve(process.env.PLATFORM_RUNTIME_DIR) : join(root, 'runtime')
const directory = join(runtime, 'certs', service)
mkdirSync(directory, { recursive: true })
const key = join(directory, 'privkey.pem')
const cert = join(directory, 'fullchain.pem')
if (existsSync(key) || existsSync(cert)) throw new Error('Existing certificate files must not be overwritten automatically')
const san = /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ? `IP:${hostname}` : `DNS:${hostname}`
execFileSync(
    'openssl',
    [
        'req',
        '-x509',
        '-newkey',
        'rsa:3072',
        '-sha256',
        '-nodes',
        '-days',
        '30',
        '-keyout',
        key,
        '-out',
        cert,
        '-subj',
        `/CN=${hostname}`,
        '-addext',
        `subjectAltName=${san}`,
    ],
    { stdio: 'ignore' }
)
chmodSync(key, 0o600)
process.stdout.write(`Self-signed cert created for ${service} in ${directory}\n`)
