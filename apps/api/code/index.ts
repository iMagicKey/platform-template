import { buildApp } from './app.js'
import { readConfig } from './config.js'

const config = readConfig()
const app = await buildApp(config)
let closing = false
async function shutdown(signal: string) {
    if (closing) return
    closing = true
    app.log.info({ event: 'service.shutdown', signal }, 'Stopping API')
    const timer = setTimeout(() => process.exit(1), 10_000)
    timer.unref()
    try {
        await app.close()
    } catch (error) {
        app.log.error({ err: error }, 'Shutdown failed')
        process.exitCode = 1
    } finally {
        clearTimeout(timer)
    }
}
process.once('SIGINT', () => {
    void shutdown('SIGINT')
})
process.once('SIGTERM', () => {
    void shutdown('SIGTERM')
})
try {
    await app.listen({ host: config.HOST, port: config.PORT })
} catch (error) {
    app.log.fatal({ err: error }, 'API startup failed')
    process.exitCode = 1
    await app.close()
}
