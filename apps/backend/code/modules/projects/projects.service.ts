import { readFileSync } from 'node:fs'
import { z } from 'zod'

export const projectSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    estimatedHours: z.number().int().min(0),
})

export type Project = z.infer<typeof projectSchema>

export const estimateRequestSchema = z.object({
    hours: z.number().int().min(1).max(1000),
    rateCents: z.number().int().min(1).max(1_000_000_000),
})

export const estimateResponseSchema = z.object({
    hours: z.number().int(),
    rateCents: z.number().int(),
    totalCents: z.number().int(),
})

export function listProjects(): Project[] {
    // Immutable tracked data; resolve relative to module so dev and compiled dist behave the same.
    const source = readFileSync(new URL('../../../data/projects.json', import.meta.url), 'utf8')
    return z.array(projectSchema).parse(JSON.parse(source))
}

export function estimateProject(input: z.infer<typeof estimateRequestSchema>) {
    const { hours, rateCents } = estimateRequestSchema.parse(input)
    return estimateResponseSchema.parse({ hours, rateCents, totalCents: hours * rateCents })
}
