'use client'

import { useState, type FormEvent } from 'react'
import { estimateProjectCost, type Estimate } from '../libs/projectsClient'
import { PlatformIcon } from './PlatformIcon'

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
        setEstimate(null)
        try {
            setEstimate(await estimateProjectCost(hours, Math.round(rate * 100)))
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to estimate')
        } finally {
            setBusy(false)
        }
    }

    return (
        <section aria-labelledby="estimate-heading" className="surface-card flex h-full flex-col overflow-hidden">
            <div className="flex items-start gap-4 border-b border-[#edf2fa] p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ebf8f6] text-[#168b82]">
                    <PlatformIcon name="calculator" size={24} />
                </span>
                <div>
                    <p className="eyebrow">API INTEGRATION</p>
                    <h3 id="estimate-heading" className="mt-1 text-xl font-bold tracking-tight text-[#18355f]">Project estimator</h3>
                    <p className="mt-2 text-sm leading-6 text-[#7185a0]">
                        Send a real request to Fastify and see typed Zod-validated business logic in action.
                    </p>
                </div>
            </div>
            <div className="flex-1 p-6">
                <form onSubmit={(event) => void handleEstimate(event)} className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-[#3e597e]">
                        Estimated hours
                        <input
                            type="number"
                            min={1}
                            max={1000}
                            step={1}
                            required
                            value={hours}
                            onChange={(event) => setHours(Number(event.target.value))}
                            className="form-control"
                        />
                    </label>
                    <label className="block text-sm font-medium text-[#3e597e]">
                        Hourly rate
                        <input
                            type="number"
                            min={0.01}
                            max={10000000}
                            step={0.01}
                            required
                            value={rate}
                            onChange={(event) => setRate(Number(event.target.value))}
                            className="form-control"
                        />
                    </label>
                    <button type="submit" disabled={busy} className="action-primary sm:col-span-2">
                        {busy ? 'Calculating…' : 'Calculate estimate'}
                        <PlatformIcon name="arrow-right" size={17} />
                    </button>
                </form>
                {estimate && (
                    <div role="status" className="mt-5 rounded-xl border border-[#c6eadd] bg-[#f1fbf6] p-4">
                        <p className="text-xs font-medium text-[#547b6a]">Estimated total · demo currency units</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#177c55]">{(estimate.totalCents / 100).toFixed(2)}</p>
                        <p className="mt-1 text-xs text-[#5e907c]">{estimate.hours} hours · integer-cent backend calculation</p>
                    </div>
                )}
                {error && (
                    <p role="alert" className="mt-5 rounded-lg bg-[#fff3f2] px-3 py-2.5 text-sm text-[#a9404e]">
                        {error}
                    </p>
                )}
            </div>
            <div className="border-t border-[#edf2fa] bg-[#fbfdff] px-6 py-3 font-mono text-xs text-[#8a9cb3]">
                POST /api/projects/estimate · via Caddy
            </div>
        </section>
    )
}
