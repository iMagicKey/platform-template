'use client'

import { useState, type FormEvent } from 'react'
import { estimateProjectCost, type Estimate } from '../libs/projectsClient'

export function ProjectEstimator() {
    const [hours, setHours] = useState(8)
    const [rate, setRate] = useState(100)
    const [estimate, setEstimate] = useState<Estimate | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function handleEstimate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setBusy(true)
        setError(null)
        try {
            setEstimate(await estimateProjectCost(hours, Math.round(rate * 100)))
        } catch (cause) {
            setEstimate(null)
            setError(cause instanceof Error ? cause.message : 'Unable to estimate')
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="rounded-2xl border border-white/10 bg-[#131d2d] p-6" aria-labelledby="estimate-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">API INTEGRATION</p>
            <h2 className="mt-2 text-xl font-semibold" id="estimate-heading">
                Project estimator
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
                A real POST /api/projects/estimate request with Zod validation and pure, separately tested backend logic.
            </p>
            <form onSubmit={(event) => void handleEstimate(event)} className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-slate-300">
                    Estimated hours
                    <input
                        type="number"
                        min={1}
                        max={1000}
                        step={1}
                        required
                        value={hours}
                        onChange={(event) => setHours(Number(event.target.value))}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-[#0b1220] px-3 py-2 text-white focus:border-emerald-400"
                    />
                </label>
                <label className="block text-sm text-slate-300">
                    Hourly rate
                    <input
                        type="number"
                        min={0.01}
                        max={10000000}
                        step={0.01}
                        required
                        value={rate}
                        onChange={(event) => setRate(Number(event.target.value))}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-[#0b1220] px-3 py-2 text-white focus:border-emerald-400"
                    />
                </label>
                <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-emerald-400 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-50 sm:col-span-2"
                >
                    {busy ? 'Calculating…' : 'Calculate with Fastify'}
                </button>
            </form>
            {estimate && (
                <p role="status" className="mt-4 rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-4 text-sm text-emerald-200">
                    Total: {(estimate.totalCents / 100).toFixed(2)} (demo currency units)
                </p>
            )}
            {error && (
                <p role="alert" className="mt-4 text-sm text-rose-300">
                    {error}
                </p>
            )}
        </section>
    )
}
