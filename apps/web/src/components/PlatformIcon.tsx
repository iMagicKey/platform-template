import type { ReactNode } from 'react'

export type PlatformIconName =
    | 'brand'
    | 'arrow-right'
    | 'arrow-up-right'
    | 'github'
    | 'monitor'
    | 'server'
    | 'layers'
    | 'bot'
    | 'boxes'
    | 'shield'
    | 'activity'
    | 'book'
    | 'file-code'
    | 'database'
    | 'search'
    | 'reset'
    | 'star'
    | 'code'
    | 'terminal'
    | 'user'
    | 'calculator'
    | 'clock'
    | 'check'
    | 'cloud'
    | 'sparkles'

const shapes: Record<PlatformIconName, ReactNode> = {
    brand: (
        <>
            <path d="M3.5 18V6l5.5 7L14.5 6v12" />
            <path d="m14.5 6 6-2-1.5 8-4.5 6" />
            <path d="m16.5 8 3 4" />
        </>
    ),
    'arrow-right': (
        <>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </>
    ),
    'arrow-up-right': (
        <>
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
        </>
    ),
    github: (
        <>
            <path d="M9 19c-4.5 1.5-4.5-2.5-6-3" />
            <path
                d="M15 22v-3.4a3.4 3.4 0 0 0-.9-2.6c3.3-.4 6.7-1.6 6.7-7.5a6 6 0 0 0-1.7-4.1 5.6 5.6 0 0 0-.1-4.1s-1.5-.5-4.5 1.7a16.5 16.5 0 0 0-8 0C3.5-.2 2 .3 2 .3a5.6 5.6 0 0 0-.1 4.1A6 6 0 0 0 .2 8.5c0 5.9 3.4 7.1 6.7 7.5A3.4 3.4 0 0 0 6 18.6V22"
                transform="translate(2 0) scale(.84)"
            />
        </>
    ),
    monitor: (
        <>
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </>
    ),
    server: (
        <>
            <rect x="4" y="3" width="16" height="7" rx="2" />
            <rect x="4" y="14" width="16" height="7" rx="2" />
            <path d="M8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5" />
        </>
    ),
    layers: (
        <>
            <path d="m12 2 9 5-9 5-9-5 9-5Z" />
            <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
        </>
    ),
    bot: (
        <>
            <rect x="4" y="7" width="16" height="14" rx="4" />
            <path d="M12 3v4M9 3h6M8 14h.01M16 14h.01M8 18h8" />
        </>
    ),
    boxes: (
        <>
            <path d="m12 2 5 3-5 3-5-3 5-3ZM7 11l5 3-5 3-5-3ZM17 11l5 3-5 3-5-3Z" />
            <path d="M7 5v5M17 5v5M12 14v5" />
        </>
    ),
    shield: (
        <>
            <path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4Z" />
            <path d="m8 12 3 3 5-6" />
        </>
    ),
    activity: <path d="M2 12h4l3-7 5 14 3-7h5" />,
    book: (
        <>
            <path d="M3 4.5A3.5 3.5 0 0 1 6.5 3H21v16H6.5A3.5 3.5 0 0 0 3 22V4.5Z" />
            <path d="M3 18.5A3.5 3.5 0 0 1 6.5 17H21" />
        </>
    ),
    'file-code': (
        <>
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7Z" />
            <path d="M13 2v7h7M9 13l-2 2 2 2M15 13l2 2-2 2" />
        </>
    ),
    database: (
        <>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 2 4 3 9 3s9-1 9-3V5M3 12c0 2 4 3 9 3s9-1 9-3" />
        </>
    ),
    search: (
        <>
            <circle cx="10.7" cy="10.7" r="7.2" />
            <path d="m16 16 5 5" />
        </>
    ),
    reset: (
        <>
            <path d="M3 11a9 9 0 1 1 2.5 6.5" />
            <path d="M3 4v7h7" />
        </>
    ),
    star: <path d="m12 2 3 6.5 7 .9-5.1 4.9 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9L12 2Z" />,
    code: (
        <>
            <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 3 10 21" />
        </>
    ),
    terminal: (
        <>
            <rect x="2" y="3" width="20" height="18" rx="3" />
            <path d="m6 9 3 3-3 3M12 16h6" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </>
    ),
    calculator: (
        <>
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l4 2" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    cloud: (
        <>
            <path d="M7 19h11a4 4 0 0 0 .5-8 7 7 0 0 0-13-1A4.5 4.5 0 0 0 7 19Z" />
        </>
    ),
    sparkles: (
        <>
            <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
        </>
    ),
}

export function PlatformIcon({ name, size = 20, className = '' }: { name: PlatformIconName; size?: number; className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {shapes[name]}
        </svg>
    )
}
