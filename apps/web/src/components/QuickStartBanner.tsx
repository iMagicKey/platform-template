import { PlatformIcon } from './PlatformIcon'

export function QuickStartBanner() {
    return (
        <section
            id="getting-started"
            aria-label="Get started with the platform"
            className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0476d9] via-[#0969cb] to-[#194aaf] px-6 py-7 text-white shadow-[0_20px_34px_-18px_rgba(24,88,177,0.38)] sm:px-9"
        >
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-24 size-64 rounded-full border-[35px] border-white/5" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                        <PlatformIcon name="terminal" size={29} />
                    </span>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Ready to build something?</h2>
                        <p className="mt-1 text-sm leading-6 text-blue-100">
                            Clone the template, run pnpm install and start your services independently.
                        </p>
                        <code className="mt-2 inline-block rounded-md bg-[#063e9a]/35 px-2.5 py-1 font-mono text-xs text-white/90">pnpm dev</code>
                    </div>
                </div>
                <a
                    href="https://github.com/iMagicKey/platform-template#quick-start"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1352ae] shadow-md transition-colors hover:bg-[#eaf4ff]"
                >
                    Get started <PlatformIcon name="arrow-right" size={17} />
                </a>
            </div>
        </section>
    )
}
