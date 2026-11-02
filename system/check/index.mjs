import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const apps = join(root, 'apps')
const errors = []
const appNames = existsSync(apps) ? readdirSync(apps, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : []

function visit(directory, visitor) {
    if (!existsSync(directory)) return
    for (const item of readdirSync(directory, { withFileTypes: true })) {
        if (['node_modules', 'dist', '.next', 'logs', 'storage'].includes(item.name)) continue
        const file = join(directory, item.name)
        if (item.isDirectory()) visit(file, visitor)
        else visitor(file)
    }
}

for (const name of appNames) {
    const app = join(apps, name)
    const packagePath = join(app, 'package.json')
    if (!existsSync(packagePath)) { errors.push(`Missing package.json: apps/${name}`); continue }
    if (!existsSync(join(app, 'AGENTS.md'))) errors.push(`Missing local AGENTS.md: apps/${name}`)
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
    for (const script of ['dev', 'build', 'start', 'test', 'typecheck', 'lint']) {
        if (!pkg.scripts?.[script]) errors.push(`Missing ${script} script: apps/${name}`)
    }
    const code = join(app, 'code')
    if (existsSync(code) && (pkg.platform?.type === 'fastify' || ['backend', 'api'].includes(name)) && !existsSync(join(code, 'routes/index.ts'))) errors.push(`Missing central route registry: apps/${name}`)
    visit(app, (file) => {
        const path = relative(root, file).replaceAll('\\', '/')
        if (/\/code\/.*\.md$/i.test(path)) errors.push(`Markdown in code/: ${path}`)
        if (!/\.[cm]?[jt]sx?$/.test(file)) return
        const source = readFileSync(file, 'utf8')
        // Excludes direct filesystem imports; runtime HTTP integration is allowed.
        if (/from\s*['"][^'"]*(?:\.\.\/)+[^'"]*apps\//.test(source) || /from\s*['"]@platform\/(?:backend|api|web|worker|bot)(?:\/|['"])/.test(source)) {
            errors.push(`Cross-app source import: ${path}`)
        }
    })
}
if (existsSync(join(apps, 'web/src/app/api')) && appNames.includes('backend')) errors.push('Public /api is owned by backend; remove apps/web/src/app/api')
if (errors.length) { for (const err of errors) process.stderr.write(`ERROR ${err}\n`); process.exitCode = 1 }
else process.stdout.write(`Architecture check passed (${appNames.length} apps).\n`)
