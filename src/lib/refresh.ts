import { z } from 'zod'
import type { Question } from './schema.ts'

export type Bank = { version: number; published_at: string; questions: Question[] }

// Written by the refresh job when it publishes; the Settings page shows it.
export const RefreshStatusSchema = z.object({
  lastPublishedAt: z.string().nullable(),
  runUrl: z.string().nullable(),
})

export type RefreshStatus = z.infer<typeof RefreshStatusSchema>

// Adds reviewed draft questions whose ids are not in the bank yet. Existing questions are never changed.
export function mergeReviewed(bank: Bank, drafts: Question[], today: string): { bank: Bank; added: string[] } {
  const known = new Set(bank.questions.map((q) => q.id))
  const fresh: Question[] = []
  for (const q of drafts) {
    if (q.review_status !== 'reviewed' || known.has(q.id)) continue
    known.add(q.id)
    fresh.push(q)
  }
  if (fresh.length === 0) return { bank, added: [] }
  return {
    bank: { version: bank.version + 1, published_at: today, questions: [...bank.questions, ...fresh] },
    added: fresh.map((q) => q.id),
  }
}
