import { PlatformIcon, type PlatformIconName } from './PlatformIcon'

export function CapabilityCard({ title, description, icon, href }: { title: string; description: string; icon: PlatformIconName; href: string }) {
    return (
        <a
            href={href}
            className="surface-card group flex min-h-40 flex-col items-start p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a7cefc] hover:shadow-[0_14px_34px_-18px_rgba(28,98,180,0.3)]"
        >
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf5ff] text-[#126fdf]">
                <PlatformIcon name={icon} size={22} />
            </span>
            <span className="mt-4 flex w-full items-center justify-between gap-2">
                <span className="font-bold tracking-tight text-[#182d56]">{title}</span>
                <PlatformIcon name="arrow-up-right" size={17} className="text-[#80a4d1] transition-colors group-hover:text-[#0866df]" />
            </span>
            <span className="mt-1.5 text-xs leading-5 text-[#7386a0]">{description}</span>
        </a>
    )
}
