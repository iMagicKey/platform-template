export function hasNewRelease(current: string, deployed: string): boolean {
    return current.length > 0 && deployed.length > 0 && current !== deployed
}
