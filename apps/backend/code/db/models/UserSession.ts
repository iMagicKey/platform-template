import { z } from 'zod'

/** Internal storage model. Session tokens are represented only by SHA-256 hashes. */
export const userSessionSchema = z.object({
    userId: z.string().min(1),
    expiresAt: z.number().int().positive(),
})

export type UserSession = z.infer<typeof userSessionSchema>
