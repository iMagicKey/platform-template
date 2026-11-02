'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

export function AuthPanel() {
    const auth = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        await auth.login(username, password)
        setPassword('')
    }

    return (
        <section className="rounded-2xl border border-white/10 bg-[#131d2d] p-6" aria-labelledby="auth-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">SESSION AUTH</p>
            <h2 className="mt-2 text-xl font-semibold" id="auth-heading">Authentication</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
                HTTP-only session cookie, verified via Fastify. Demo login must be explicitly configured and is forbidden in production.
            </p>
            {auth.status === 'checking' && <p role="status" className="mt-5 text-sm text-slate-300">Checking auth configuration…</p>}
            {auth.status === 'unavailable' && <p role="alert" className="mt-5 text-sm text-amber-200">Backend is not reachable through /api. Run Caddy.</p>}
            {auth.status === 'disabled' && <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Demo authentication is disabled. Configure AUTH_MODE=demo, password hash and allowed origin in the backend env file to try it.
            </p>}
            {auth.status === 'authenticated' && (
                <div className="mt-5 space-y-4">
                    <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-200" role="status">
                        Signed in as <strong>{auth.user?.id}</strong>. No tokens are stored in localStorage.
                    </p>
                    <button type="button" disabled={auth.busy} onClick={() => void auth.logout()}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50">
                        {auth.busy ? 'Signing out…' : 'Sign out'}
                    </button>
                </div>
            )}
            {auth.status === 'anonymous' && (
                <form onSubmit={(event) => void handleLogin(event)} className="mt-5 space-y-3">
                    <label className="block text-sm text-slate-300">
                        Login
                        <input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)}
                            className="mt-1 block w-full rounded-lg border border-white/20 bg-[#0b1220] px-3 py-2 text-white outline-none focus:border-sky-400" />
                    </label>
                    <label className="block text-sm text-slate-300">
                        Password
                        <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}
                            className="mt-1 block w-full rounded-lg border border-white/20 bg-[#0b1220] px-3 py-2 text-white outline-none focus:border-sky-400" />
                    </label>
                    <button type="submit" disabled={auth.busy}
                        className="rounded-lg bg-sky-400 px-4 py-2 font-medium text-slate-950 hover:bg-sky-300 disabled:opacity-50">
                        {auth.busy ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            )}
            {auth.error && <p role="alert" className="mt-4 text-sm text-rose-300">{auth.error}</p>}
        </section>
    )
}
