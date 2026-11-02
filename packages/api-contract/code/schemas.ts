import { z } from 'zod'

export const apiIssueSchema = z.object({
    path: z.array(z.union([z.string(), z.number()])),
    code: z.string(),
    message: z.string(),
})

export const apiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    issues: z.array(apiIssueSchema).optional(),
})

export function dataResponseSchema<T extends z.ZodType>(dataSchema: T) {
    return z.object({ data: dataSchema, error: z.null() })
}

/** Exact code enables route-local response typing and OpenAPI output. */
export function errorResponseSchema<const Code extends string>(code: Code) {
    return z.object({
        data: z.null(),
        error: apiErrorSchema.extend({ code: z.literal(code) }),
    })
}
