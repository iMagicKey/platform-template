import { PlatformIcon, type PlatformIconName } from './PlatformIcon'

export function FeatureTile({ title, description, icon }: { title: string; description: string; icon: PlatformIconName }) {
    return (
        <article className="surface-card flex items-center gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#156ed7]">
                <PlatformIcon name={icon} size={23} />
            </span>
            <div>
                <h3 className="font-bold tracking-tight text-[#17345e]">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#788aa4]">{description}</p>
            </div>
        </article>
    )
}
