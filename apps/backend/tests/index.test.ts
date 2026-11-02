import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import test from 'node:test'

const APP_ROOT = new URL('..', import.meta.url)
const HOLD_EVENT_LOOP = 'data:text/javascript,setInterval(()=>{},1000)'

async function freePort(): Promise<number> {
    const server = createServer()
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    assert.ok(address && typeof address === 'object')
    await new Promise((resolve) => server.close(resolve))
    return address.port
}

/** The shutdown deadline lives in module-level lifecycle code, so exercise the real entry point. */
async function runUntilStopped(imports: string[]) {
    const child = spawn(process.execPath, ['--import', 'tsx', ...imports.flatMap((value) => ['--import', value]), 'code/index.ts'], {
        cwd: APP_ROOT,
        env: {
            ...process.env,
            NODE_ENV: 'test',
            HOST: '127.0.0.1',
            PORT: String(await freePort()),
            LOG_LEVEL: 'info',
            LOG_OUTPUT: 'stdout',
            DOCS_ENABLED: 'false',
            AUTH_MODE: 'disabled',
            WS_DEMO_TOKEN: '',
            NODE_TEST_CONTEXT: undefined,
        },
        stdio: ['ignore', 'pipe', 'inherit'],
    })
    // Longer than the 10s deadline: an unbounded shutdown fails the assertion instead of hanging the suite.
    const guard = setTimeout(() => child.kill('SIGKILL'), 15_000)
    let output = ''
    const exited = new Promise<number | null>((resolve) => child.once('exit', resolve))
    await new Promise<void>((resolve, reject) => {
        child.stdout.on('data', (chunk) => {
            output += String(chunk)
            if (output.includes('Server listening')) resolve()
        })
        void exited.then((code) => reject(new Error(`Backend exited before listening with ${code}: ${output}`)))
    })
    child.kill('SIGTERM')
    const code = await exited
    clearTimeout(guard)
    return { code, output }
}

test('SIGTERM stops an idle backend with exit code 0', async () => {
    const { code, output } = await runUntilStopped([])
    assert.equal(code, 0)
    assert.match(output, /"event":"service\.shutdown"/)
    assert.doesNotMatch(output, /Graceful shutdown timed out/)
})

test('the shutdown deadline still applies when a handle outlives app.close()', async () => {
    const { code, output } = await runUntilStopped([HOLD_EVENT_LOOP])
    assert.equal(code, 1)
    assert.match(output, /Graceful shutdown timed out/)
})
