import { PlatformIcon } from './PlatformIcon'

const technologies = ['Next.js', 'Fastify', 'TypeScript', 'Zustand', 'Monorepo']

export function PlatformHero() {
    return (
        <section
            id="overview"
            aria-labelledby="hero-heading"
            className="relative isolate overflow-hidden rounded-[28px] border border-[#dceafe] bg-linear-115 from-[#f8fbff] via-[#e9f3ff] to-[#cfe5ff] shadow-[0_22px_70px_-40px_rgba(34,99,183,0.32)]"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    backgroundImage:
                        'linear-gradient(130deg,transparent 35%,rgba(255,255,255,.48) 50%,transparent 63%),radial-gradient(ellipse at 89% 18%,rgba(96,169,255,.4),transparent 42%)',
                }}
            />
            <div className="relative grid items-center gap-10 px-7 py-12 sm:px-12 sm:py-15 lg:grid-cols-[1.14fr_.86fr] lg:gap-2 lg:px-16 lg:py-18">
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#c7dfff] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#266bcb]">
                        <PlatformIcon name="sparkles" size={14} /> A better starting point for your next project
                    </span>
                    <h1
                        id="hero-heading"
                        className="mt-6 max-w-[680px] text-[clamp(2.5rem,5vw,4rem)] leading-[1.07] font-extrabold tracking-[-0.065em] text-[#0b3177]"
                    >
                        iMagic
                        <span className="block">Platform Template</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#4d6689] sm:text-[17px]">
                        A modern TypeScript monorepo foundation. Independent services, real API integrations and developer-friendly architecture,
                        ready to make your own.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <a href="#demo" className="action-primary">
                            Try live demos <PlatformIcon name="arrow-right" size={17} />
                        </a>
                        <a
                            href="https://github.com/iMagicKey/platform-template/blob/main/README.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-secondary"
                        >
                            Read the docs <PlatformIcon name="book" size={17} />
                        </a>
                    </div>
                    <ul aria-label="Technology stack" className="mt-9 flex flex-wrap gap-2">
                        {technologies.map((name) => (
                            <li key={name} className="subtle-tag border-[#cee3fb] bg-white/65 text-[#365a89]">
                                <span className="size-1.5 rounded-full bg-[#1489ed]" />
                                {name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div aria-hidden="true" className="relative hidden min-h-[320px] items-center justify-center lg:flex">
                    <div className="absolute right-[7%] bottom-[4%] h-20 w-[75%] rounded-full bg-[#71a8ec]/25 blur-3xl" />
                    <div className="relative h-[300px] w-[360px] -rotate-[21deg]">
                        <div className="absolute top-[124px] left-[57px] flex h-44 w-64 rotate-[13deg] items-center justify-center rounded-[34px] border border-[#8dc2ff] bg-gradient-to-br from-[#8dc6ff] to-[#347fe5] shadow-[0_25px_38px_rgba(13,81,174,0.27)]" />
                        <div className="absolute top-[85px] left-[57px] h-44 w-64 rotate-[13deg] rounded-[34px] border border-[#8ac6ff] bg-gradient-to-br from-[#b8e1ff] to-[#549be9] shadow-[0_19px_32px_rgba(13,81,174,0.22)]" />
                        <div className="absolute top-[45px] left-[57px] flex h-44 w-64 rotate-[13deg] items-center justify-center rounded-[34px] border border-[#b6e5ff] bg-gradient-to-br from-[#7bd3ff] via-[#3698f9] to-[#2563de] shadow-[0_19px_38px_rgba(17,100,220,0.31)]">
                            <span className="rotate-[8deg] rounded-2xl bg-white/15 p-5 text-white drop-shadow-md">
                                <PlatformIcon name="code" size={78} />
                            </span>
                        </div>
                        <span className="absolute top-4 left-3 size-4 rounded-md bg-white/70 shadow-[0_0_25px_white]" />
                        <span className="absolute right-2 bottom-5 size-3 rounded-sm bg-[#7abfff] shadow-[0_0_25px_#7abfff]" />
                    </div>
                </div>
            </div>
        </section>
    )
}
