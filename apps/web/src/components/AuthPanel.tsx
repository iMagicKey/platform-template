'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PlatformIcon } from './PlatformIcon'

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
        <section aria-labelledby="auth-heading" className="surface-card flex h-full flex-col overflow-hidden">
            <div className="flex items-start gap-4 border-b border-[#edf2fa] p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#176fde]">
                    <PlatformIcon name="user" size={24} />
                </span>
                <div>
                    <p className="eyebrow">SESSION AUTH</p>
                    <h3 id="auth-heading" className="mt-1 text-xl font-bold tracking-tight text-[#18355f]">Demo authentication</h3>
                    <p className="mt-2 text-sm leading-6 text-[#7185a0]">
                        Fastify sessions with an HttpOnly cookie. Demo credentials are configured explicitly and never enabled in production.
                    </p>
                </div>
            </div>
            <div className="flex-1 p-6">
                {auth.status === 'checking' && (
                    <p role="status" className="rounded-xl bg-[#f4f8fe] p-4 text-sm text-[#5e7799]">
                        Checking authentication configuration…
                    </p>
                )}
                {auth.status === 'unavailable' && (
                    <p role="alert" className="rounded-xl border border-[#fbd9d9] bg-[#fff7f5] p-4 text-sm leading-6 text-[#a54e50]">
                        Backend is unreachable through /api. Start Caddy on port 8080 to use this demo.
                    </p>
                )}
                {auth.status === 'disabled' && (
                    <div className="rounded-xl border border-[#dceafa] bg-[#f4f9ff] p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[#315b8d]">
                            <PlatformIcon name="shield" size={18} /> Demo login is disabled
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6c84a1]">
                            Set AUTH_MODE=demo, a password hash and AUTH_ALLOWED_ORIGINS in the backend environment to try the login flow.
                        </p>
                        <a
                            href="https://github.com/iMagicKey/platform-template#optional-development-authentication"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#136ed1] hover:underline"
                        >
                            Setup instructions <PlatformIcon name="arrow-up-right" size={14} />
                        </a>
                    </div>
                )}
                {auth.status === 'authenticated' && (
                    <div className="space-y-4">
                        <div role="status" className="rounded-xl border border-[#caebda] bg-[#f0fbf5] p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-[#21764b]">
                                <PlatformIcon name="check" size={18} /> Session active
                            </p>
                            <p className="mt-2 text-sm text-[#466c5c]">Signed in as <strong>{auth.user?.id}</strong>. No tokens are saved in localStorage.</p>
                        </div>
                        <button type="button" disabled={auth.busy} onClick={() => void auth.logout()} className="action-secondary">
                            {auth.busy ? 'Signing out…' : 'Sign out'} <PlatformIcon name="arrow-right" size={16} />
                        </button>
                    </div>
                )}
                {auth.status === 'anonymous' && (
                    <form onSubmit={(event) => void handleLogin(event)} className="space-y-4">
                        <label className="block text-sm font-medium text-[#3e597e]">
                            Login
                            <input
                                autoComplete="username"
                                required
                                maxLength={128}
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                className="form-control"
                                placeholder="Your demo username"
                            />
                        </label>
                        <label className="block text-sm font-medium text-[#3e597e]">
                            Password
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                maxLength={512}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="form-control"
                                placeholder="Your demo password"
                            />
                        </label>
                        <button type="submit" disabled={auth.busy} className="action-primary w-full">
                            {auth.busy ? 'Signing in…' : 'Sign in'} <PlatformIcon name="arrow-right" size={17} />
                        </button>
                    </form>
                )}
                {auth.error && (
                    <p role="alert" className="mt-4 rounded-lg bg-[#fff3f2] px-3 py-2.5 text-sm text-[#a9404e]">
                        {auth.error}
                    </p>
                )}
            </div>
            <div className="border-t border-[#edf2fa] bg-[#fbfdff] px-6 py-3 text-xs text-[#8a9cb3]">
                Development example · No real user accounts
            </div>
        </section>
    )
}
