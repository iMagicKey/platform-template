import type { Metadata } from 'next'
import { UpdateBanner } from '../components/update-banner'
import { BUILD_RELEASE } from '../consts/release'
import './globals.css'

export const metadata: Metadata = {
    title: 'Universal Platform Template',
    description: 'Next.js frontend of an independent-services TypeScript monorepo',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru">
            <body>
                {children}
                <UpdateBanner release={BUILD_RELEASE} />
            </body>
        </html>
    )
}
