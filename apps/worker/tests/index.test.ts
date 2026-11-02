import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import test from 'node:test'

const APP_ROOT = new URL('..', import.meta.url)
const HOLD_EVENT_LOOP = 'data:text/javascript,setInterval(()=>{},1000)'

/** The shutdown deadline lives in module-level lifecycle code, so exercise the real entry point. */
async function runUntilStopped(imports: string[]) {
    const child = spawn(process.execPath, ['--import', 'tsx', ...imports.flatMap((value) => ['--import', value]), 'code/index.ts'], {
        cwd: APP_ROOT,
        env: { ...process.env, NODE_ENV: 'test', LOG_LEVEL: 'info', LOG_OUTPUT: 'stdout', SCHEDULER_ENABLED: 'false', NODE_TEST_CONTEXT: undefined },
        stdio: ['ignore', 'pipe', 'inherit'],
    })
    // Longer than the 10s deadline: an unbounded shutdown fails the assertion instead of hanging the suite.
    const guard = setTimeout(() => child.kill('SIGKILL'), 15_000)
    let output = ''
    const exited = new Promise<number | null>((resolve) => child.once('exit', resolve))
    await new Promise<void>((resolve, reject) => {
        child.stdout.on('data', (chunk) => {
            output += String(chunk)
            if (output.includes('"event":"service.started"')) resolve()
        })
        void exited.then((code) => reject(new Error(`Worker exited before starting with ${code}: ${output}`)))
    })
    child.kill('SIGTERM')
    const code = await exited
    clearTimeout(guard)
    return { code, output }
}

test('SIGTERM stops an idle worker with exit code 0', async () => {
    const { code, output } = await runUntilStopped([])
    assert.equal(code, 0)
    assert.match(output, /"event":"service\.shutdown"/)
    assert.doesNotMatch(output, /"event":"service\.shutdown\.timeout"/)
})

test('the shutdown deadline still applies when a timed-out task keeps the event loop alive', async () => {
    const { code, output } = await runUntilStopped([HOLD_EVENT_LOOP])
    assert.equal(code, 1)
    assert.match(output, /"event":"service\.shutdown\.timeout"/)
})
