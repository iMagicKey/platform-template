import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const apps = join(root, 'apps')
const runtime = process.env.PLATFORM_RUNTIME_DIR ? resolve(process.env.PLATFORM_RUNTIME_DIR) : join(root, 'runtime')
for (const name of ['certs', 'secrets']) mkdirSync(join(runtime, name), { recursive: true })

if (existsSync(apps)) {
    for (const item of readdirSync(apps, { withFileTypes: true })) {
        if (!item.isDirectory()) continue
        const dir = join(apps, item.name)
        for (const name of ['logs', 'storage']) mkdirSync(join(dir, name), { recursive: true })
        const example = join(dir, '.env.example')
        const env = join(dir, '.env')
        if (existsSync(example) && !existsSync(env)) cpSync(example, env)
    }
}
process.stdout.write(`Initialized local runtime at ${runtime}. Existing .env files were preserved.\n`)
