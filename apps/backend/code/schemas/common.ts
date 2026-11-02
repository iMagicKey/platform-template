import { z } from 'zod'

/** Reusable exact error-code response; each route still declares its own HTTP status. */
export function errorResponseSchema<const T extends string>(code: T) {
    return z.object({ error: z.literal(code) })
}
