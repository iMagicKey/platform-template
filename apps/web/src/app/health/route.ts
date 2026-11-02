import { NextResponse } from 'next/server'
import { APP_VERSION, BUILD_RELEASE } from '../../consts/release'

export const dynamic = 'force-dynamic'

export function GET() {
    return NextResponse.json({
        status: 'ok',
        ready: true,
        service: 'web',
        version: APP_VERSION,
        release: BUILD_RELEASE,
    }, { headers: { 'Cache-Control': 'no-store' } })
}
