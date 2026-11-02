import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const root = process.argv[2] ? resolve(process.argv[2]) : resolve(import.meta.dirname, '..')
const apps = join(root, 'apps')
const packages = join(root, 'packages')
const errors: string[] = []

function within(path: string, directory: string): boolean {
    return path === directory || path.startsWith(directory + sep)
}

function visit(directory: string, visitor: (file: string) => void): void {
    if (!existsSync(directory)) return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (['node_modules', 'dist', '.next', 'logs', 'storage', 'coverage'].includes(entry.name)) continue
        const file = join(directory, entry.name)
        if (entry.isDirectory()) visit(file, visitor)
        else if (entry.isFile()) visitor(file)
    }
}

function checkNames(directory: string, kind: 'PascalCase' | 'useHook' | 'camelCase'): void {
    visit(directory, (file) => {
        if (!/\.tsx?$/.test(file) || /\.d\.ts$/.test(file)) return
        const name = file
            .split(sep)
            .at(-1)!
            .replace(/\.tsx?$/, '')
        const valid =
            kind === 'PascalCase'
                ? /^[A-Z][a-zA-Z0-9]*$/.test(name)
                : kind === 'useHook'
                  ? /^use[A-Z][a-zA-Z0-9]*$/.test(name)
                  : /^[a-z][a-zA-Z0-9]*$/.test(name)
        if (!valid) errors.push(`Expected ${kind} filename: ${relative(root, file)}`)
    })
}

const appNames = existsSync(apps)
    ? readdirSync(apps, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
    : []
const packageNames = existsSync(packages)
    ? readdirSync(packages, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
    : []

if (!existsSync(join(root, 'docs', 'ARCHITECTURE.md'))) errors.push('Missing docs/ARCHITECTURE.md')
if (existsSync(join(root, 'ARCHITECTURE.md'))) errors.push('ARCHITECTURE.md belongs in docs/, not the root')

const web = join(apps, 'web', 'src')
for (const folder of ['components', 'containers', 'providers']) checkNames(join(web, folder), 'PascalCase')
checkNames(join(web, 'hooks'), 'useHook')
checkNames(join(web, 'store'), 'camelCase')

for (const name of appNames) {
    const app = join(apps, name)
    const manifest = join(app, 'package.json')
    if (!existsSync(manifest)) {
        errors.push(`Missing package.json: apps/${name}`)
        continue
    }
    if (!existsSync(join(app, 'AGENTS.md'))) errors.push(`Missing local AGENTS.md: apps/${name}`)
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    for (const script of ['dev', 'build', 'start', 'test', 'typecheck', 'lint']) {
        if (!pkg.scripts?.[script]) errors.push(`Missing ${script} script: apps/${name}`)
    }
    const code = join(app, 'code')
    if (existsSync(code) && (pkg.platform?.type === 'fastify' || ['backend', 'api'].includes(name)) && !existsSync(join(code, 'routes/index.ts'))) {
        errors.push(`Missing central route registry: apps/${name}`)
    }

    checkNames(join(code, 'db', 'models'), 'PascalCase')
    const routes = join(code, 'routes')
    const seen = new Map<string, string>()
    visit(routes, (file) => {
        if (!/\.ts$/.test(file) || /\.d\.ts$/.test(file)) return
        const route = relative(routes, file).split(sep).join('/').replace(/\.ts$/, '')
        if (route.split('/').some((segment) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))) {
            errors.push(`Invalid lowercase/kebab-case route segment: ${relative(root, file)}`)
        }
        const text = readFileSync(file, 'utf8')
        const routeCall = /\.(get|post|put|patch|delete|head|options)\s*\(\s*['"]([^'"]+)['"]/g
        for (const match of text.matchAll(routeCall)) {
            const key = `${match[1]!.toUpperCase()} ${match[2]}`
            const previous = seen.get(key)
            if (previous) errors.push(`Duplicate HTTP route ${key}: ${previous}, ${relative(root, file)}`)
            else seen.set(key, relative(root, file))
        }
    })
}

const workspaceNames = new Map<string, string>()
for (const name of appNames) {
    const file = join(apps, name, 'package.json')
    if (existsSync(file)) workspaceNames.set(JSON.parse(readFileSync(file, 'utf8')).name, name)
}

function checkSource(file: string, owner: string): void {
    const relativeFile = relative(root, file).split(sep).join('/')
    if (/\/code\/.*\.md$/i.test(relativeFile)) errors.push(`Markdown in code/: ${relativeFile}`)
    if (!/\.[cm]?[jt]sx?$/.test(file)) return
    const code = readFileSync(file, 'utf8')
    const importSpec = /\b(?:from\s*|import\s*\(\s*|import\s*|require\s*\(\s*)['"]([^'"]+)['"]/g
    for (const match of code.matchAll(importSpec)) {
        const spec = match[1]!
        if (spec.startsWith('.')) {
            const target = resolve(dirname(file), spec)
            for (const app of appNames) {
                if (app !== owner && within(target, join(apps, app))) {
                    errors.push(`Cross-app source import: ${relativeFile} -> ${spec}`)
                }
            }
            if (owner.startsWith('package:') && within(target, apps)) {
                errors.push(`Shared package imports app source: ${relativeFile} -> ${spec}`)
            }
        } else {
            const target = workspaceNames.get(spec.split('/').slice(0, 2).join('/'))
            if (target && target !== owner) errors.push(`Cross-app workspace import: ${relativeFile} -> ${spec}`)
        }
    }
}

// Keep test code entirely outside production application, package and system trees.
for (const directory of [apps, packages, join(root, 'system')]) {
    visit(directory, (file) => {
        const path = relative(root, file).split(sep).join('/')
        if (/(?:^|\/)(?:tests?|__tests__)\/|\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)) {
            errors.push(`Test files must live under root tests/: ${path}`)
        }
    })
}

for (const name of appNames) visit(join(apps, name), (file) => checkSource(file, name))
for (const name of packageNames) visit(join(packages, name), (file) => checkSource(file, `package:${name}`))

if (existsSync(join(web, 'app', 'api')) && appNames.includes('backend')) {
    errors.push('Public /api is owned by backend; remove apps/web/src/app/api')
}

if (errors.length) {
    for (const error of errors) process.stderr.write(`ERROR ${error}\n`)
    process.exitCode = 1
} else {
    process.stdout.write(`Architecture check passed (${appNames.length} apps, ${packageNames.length} shared packages).\n`)
}
