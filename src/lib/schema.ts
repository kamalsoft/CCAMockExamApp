import { z } from 'zod'

const text = z.string().trim().min(1)

// Weights stay "TODO" until copied from the official exam guide; see content/blueprint.md.
export const DomainSchema = z.object({
  id: z.string().regex(/^d\d+$/),
  name: text,
  weight: z.union([z.number().min(0).max(100), z.literal('TODO')]),
  description: text,
  walkthroughId: z.string().nullable(),
  labId: z.string().nullable(),
})

export const DomainsSchema = z.array(DomainSchema).min(1)

export const QuestionSchema = z
  .object({
    id: z.string().regex(/^d\d+-\d{3}$/),
    domain: z.string().regex(/^d\d+$/),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    type: z.enum(['single', 'multi']),
    scenario: text.optional(),
    question: text,
    options: z.array(z.object({ key: z.string().regex(/^[A-E]$/), text })).min(4).max(5),
    answer: z.array(z.string()).min(1),
    explanation: z.object({
      correct: text,
      distractors: z.record(z.string(), text),
    }),
    concepts: z.array(text).min(1),
    source: z.literal('original'),
    sources: z.array(text),
    review_status: z.enum(['draft', 'reviewed']),
    reviewed_by: text.nullable(),
    reviewed_at: z.iso.date().nullable(),
  })
  .superRefine((q, ctx) => {
    const issue = (message: string, path: string) => ctx.addIssue({ code: 'custom', message, path: [path] })
    const keys = q.options.map((o) => o.key)
    if (new Set(keys).size !== keys.length) issue('option keys must be unique', 'options')
    if (!q.id.startsWith(`${q.domain}-`)) issue(`id must start with "${q.domain}-"`, 'id')
    if (new Set(q.answer).size !== q.answer.length) issue('answer keys must be unique', 'answer')
    for (const a of q.answer) if (!keys.includes(a)) issue(`answer "${a}" is not an option key`, 'answer')
    if (q.type === 'single' && q.answer.length !== 1) issue('single questions need exactly one answer', 'answer')
    if (q.type === 'multi' && q.answer.length < 2) issue('multi questions need at least two answers', 'answer')

    const wrong = keys.filter((k) => !q.answer.includes(k))
    const explained = Object.keys(q.explanation.distractors)
    for (const k of wrong) if (!explained.includes(k)) issue(`missing explanation for wrong option "${k}"`, 'explanation')
    for (const k of explained) if (!wrong.includes(k)) issue(`"${k}" is not a wrong option`, 'explanation')

    if (q.review_status === 'reviewed' && (!q.reviewed_by || !q.reviewed_at)) {
      issue('reviewed questions need reviewed_by and reviewed_at', 'review_status')
    }
  })

export type Domain = z.infer<typeof DomainSchema>
export type Question = z.infer<typeof QuestionSchema>
