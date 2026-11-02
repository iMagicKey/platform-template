import { APP_VERSION } from '../consts/release'
import { PlatformIcon } from './PlatformIcon'

const navigation = [
    { href: '#overview', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#demo', label: 'Live demo' },
]

export function PlatformHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-[#dfeaf7]/90 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex min-h-[76px] max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
                <a href="#overview" aria-label="iMagic Platform Template home" className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0477ec] to-[#0050b5] text-white shadow-[0_6px_14px_rgba(0,96,208,0.24)]">
                        <PlatformIcon name="brand" size={25} />
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-[17px] font-extrabold tracking-[-0.045em] text-[#102d66]">iMagic</span>
                        <span className="text-[10px] font-medium tracking-wide text-[#6780a4]">PLATFORM TEMPLATE</span>
                    </span>
                </a>
                <nav aria-label="Main navigation" className="order-3 w-full sm:order-2 sm:w-auto">
                    <ul className="flex items-center gap-5 text-sm font-medium text-[#59718f] sm:gap-8">
                        {navigation.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className="inline-block py-2 transition-colors hover:text-[#0866db]">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a
                                href="https://github.com/iMagicKey/platform-template/blob/main/docs/ARCHITECTURE.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block py-2 transition-colors hover:text-[#0866db]"
                            >
                                Docs
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="order-2 flex items-center gap-3 sm:order-3">
                    <span className="hidden rounded-full border border-[#e0eaf7] bg-[#f8fbff] px-3 py-1.5 font-mono text-[11px] text-[#7b8eaa] lg:inline-flex">
                        v{APP_VERSION}
                    </span>
                    <a href="#demo" className="action-primary px-4 py-2.5 text-xs sm:text-sm">
                        Explore demo <PlatformIcon name="arrow-right" size={15} />
                    </a>
                </div>
            </div>
        </header>
    )
}
