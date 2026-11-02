import { randomBytes, scryptSync } from 'node:crypto'
import { readFileSync } from 'node:fs'

// Example: read -rs PASSWORD; printf %s "$PASSWORD" | pnpm system:password; unset PASSWORD
if (process.stdin.isTTY) {
    process.stderr.write('Pipe the password via stdin, not as a command-line argument.\n')
    process.exit(2)
}
const password = readFileSync(0, 'utf8').replace(/\r?\n$/, '')
if (password.length < 12) {
    process.stderr.write('Demo password must be at least 12 characters.\n')
    process.exit(2)
}
const salt = randomBytes(16)
const hash = scryptSync(password, salt, 64)
process.stdout.write(`scrypt$${salt.toString('hex')}$${hash.toString('hex')}\n`)
