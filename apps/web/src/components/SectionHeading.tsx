import type { ReactNode } from 'react'

export function SectionHeading({
    eyebrow,
    title,
    description,
    id,
    action,
    centered = false,
}: {
    eyebrow: string
    title: string
    description: string
    id: string
    action?: ReactNode
    centered?: boolean
}) {
    return (
        <div className={centered ? 'mb-7 text-center' : 'mb-6 flex flex-wrap items-end justify-between gap-4'}>
            <div className={centered ? 'mx-auto max-w-xl' : 'max-w-2xl'}>
                <p className="eyebrow">{eyebrow}</p>
                <h2 id={id} className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#102a58] sm:text-[30px]">
                    {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#677d9b]">{description}</p>
            </div>
            {action}
        </div>
    )
}
