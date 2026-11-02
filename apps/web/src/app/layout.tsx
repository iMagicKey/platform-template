import type { Metadata } from 'next'
import { UpdateBanner } from '../components/UpdateBanner'
import { BUILD_RELEASE } from '../consts/release'
import './globals.css'

export const metadata: Metadata = {
    title: 'iMagic Platform Template · Next.js + Fastify',
    description: 'A practical TypeScript monorepo foundation with independent services, real API demos and an extendable architecture.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                {children}
                <UpdateBanner release={BUILD_RELEASE} />
            </body>
        </html>
    )
}
