import { APP_VERSION } from '../consts/release'

export function HomeContainer() {
    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 p-8">
            <div className="inline-flex w-fit rounded-full border border-sky-400/50 px-3 py-1 text-sm text-sky-300">Platform Template v{APP_VERSION}</div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">One repository. Independent services.</h1>
            <p className="text-lg text-slate-300">
                Native Next.js frontend, independent Fastify backend and API. This is a working application skeleton:
                replace these examples with your product. No demo login or credentials are enabled.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-700 p-5">
                    <h2 className="text-lg font-semibold">Frontend health</h2>
                    <a className="text-sky-300 underline" href="/health">/health</a>
                </div>
                <div className="rounded-xl border border-slate-700 p-5">
                    <h2 className="text-lg font-semibold">Backend through Caddy</h2>
                    <p className="text-slate-400">/api/health and /api/docs</p>
                </div>
            </div>
        </main>
    )
}
