import { execFileSync } from 'node:child_process'

const allowedTypes = new Set(['feat', 'fix', 'refactor', 'perf', 'docs', 'test', 'style', 'build', 'ci', 'chore', 'revert'])

/** Validate one commit's subject. Bodies and Git trailers are intentionally optional. */
export function validateCommitSubject(message: string): string[] {
    const subject = message.trim().split(/\r?\n/, 1)[0] ?? ''
    const errors: string[] = []
    const match = /^(?<type>[a-z]+)(?:\((?<scope>[a-z][a-z0-9]*(?:-[a-z0-9]+)*)\))?(?<breaking>!)?: (?<summary>.+)$/.exec(subject)

    if (!match?.groups) return ['Expected "type(scope): lowercase imperative summary" (scope optional)']
    const { type, summary } = match.groups
    if (!type || !allowedTypes.has(type)) errors.push(`Unsupported commit type: ${type ?? ''}`)
    if (subject.length > 72) errors.push('Subject must be 72 characters or fewer')
    if (!summary || !/^[a-z0-9]/.test(summary)) errors.push('Summary must begin with a lowercase English word or a digit')
    if (summary && /[.!]$/.test(summary)) errors.push('Summary must not end with punctuation')
    if (summary && /\s{2,}/.test(summary)) errors.push('Summary must use single spaces')
    return errors
}

if (import.meta.main) {
    const message = process.argv[2] ?? execFileSync('git', ['log', '-1', '--format=%B'], { encoding: 'utf8' })
    const errors = validateCommitSubject(message)
    if (errors.length) {
        for (const error of errors) process.stderr.write(`Invalid commit message: ${error}\n`)
        process.exitCode = 1
    } else {
        process.stdout.write('Conventional Commit subject OK\n')
    }
}
