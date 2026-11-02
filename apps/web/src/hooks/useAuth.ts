'use client'

import { useEffect, useState } from 'react'
import { getAuthConfiguration, getCurrentUser, loginUser, logoutUser, type CurrentUser } from '../libs/authClient'

export type AuthStatus = 'checking' | 'unavailable' | 'disabled' | 'anonymous' | 'authenticated'

export function useAuth() {
    const [status, setStatus] = useState<AuthStatus>('checking')
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let active = true
        const load = async () => {
            try {
                const configured = await getAuthConfiguration()
                const current = configured ? await getCurrentUser() : null
                if (active) {
                    setUser(current)
                    setStatus(configured ? (current ? 'authenticated' : 'anonymous') : 'disabled')
                }
            } catch (cause) {
                if (active) {
                    setStatus('unavailable')
                    setError(cause instanceof Error ? cause.message : 'Backend unavailable')
                }
            }
        }
        void load()
        return () => {
            active = false
        }
    }, [])

    const login = async (username: string, password: string): Promise<boolean> => {
        setBusy(true)
        setError(null)
        try {
            const current = await loginUser(username, password)
            setUser(current)
            setStatus('authenticated')
            return true
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Login failed')
            return false
        } finally {
            setBusy(false)
        }
    }

    const logout = async () => {
        setBusy(true)
        setError(null)
        try {
            await logoutUser()
            setUser(null)
            setStatus('anonymous')
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Logout failed')
        } finally {
            setBusy(false)
        }
    }
    return { status, user, error, busy, login, logout }
}
