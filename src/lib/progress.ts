import { z } from 'zod'
import { isCorrect, scoreByDomain, type Responses } from './drill.ts'
import type { Question } from './schema.ts'

const ScoreSchema = z.object({ correct: z.number(), total: z.number() })

export const AttemptSchema = z.object({
  id: z.string(),
  mode: z.enum(['drill', 'exam']),
  started_at: z.string(),
  finished_at: z.string(),
  question_ids: z.array(z.string()),
  responses: z.record(z.string(), z.array(z.string())),
  score_by_domain: z.record(z.string(), ScoreSchema),
  /** A mock exam with the full official question count. Only full exams count toward readiness. */
  full: z.boolean(),
})

const ProgressSchema = z.object({
  attempts: z.array(AttemptSchema),
  labsCompleted: z.record(z.string(), z.boolean()),
  walkthroughsSeen: z.record(z.string(), z.string()),
})

export type Attempt = z.infer<typeof AttemptSchema>
export type Progress = z.infer<typeof ProgressSchema>

export const emptyProgress = (): Progress => ({ attempts: [], labsCompleted: {}, walkthroughsSeen: {} })

/** Where progress lives. localStorage today; a backend can implement the same interface later. */
export type ProgressRepository = { load(): Progress; save(progress: Progress): void }

const KEY = 'cca-progress-v1'

export function localStorageRepository(custom?: Pick<Storage, 'getItem' | 'setItem'>): ProgressRepository {
  // Looked up lazily: even reading window.localStorage throws when site data is blocked.
  const storage = () => custom ?? window.localStorage
  return {
    load() {
      // Stored data is user-controlled and may be stale or corrupt: validate it, and start fresh if it's unusable.
      try {
        const parsed = ProgressSchema.safeParse(JSON.parse(storage().getItem(KEY) ?? 'null'))
        return parsed.success ? parsed.data : emptyProgress()
      } catch {
        return emptyProgress()
      }
    },
    save(progress) {
      try {
        storage().setItem(KEY, JSON.stringify(progress))
      } catch {
        // Storage can be full or blocked (private mode). Progress then lasts for this visit only.
      }
    },
  }
}

export function makeAttempt(mode: Attempt['mode'], questions: Question[], responses: Responses, startedAt: number, full: boolean): Attempt {
  return {
    id: `${mode}-${startedAt}`,
    mode,
    started_at: new Date(startedAt).toISOString(),
    finished_at: new Date().toISOString(),
    question_ids: questions.map((q) => q.id),
    responses,
    score_by_domain: scoreByDomain(questions, responses),
    full,
  }
}

// Same id means the same attempt, so a repeated save never double-counts it.
export const recordAttempt = (progress: Progress, attempt: Attempt): Progress =>
  progress.attempts.some((a) => a.id === attempt.id) ? progress : { ...progress, attempts: [...progress.attempts, attempt] }

export type ConceptStat = { concept: string; domain: string; correct: number; total: number }

/** Accuracy per concept across every answered question, weakest first. Questions no longer in the bank are skipped. */
export function conceptAccuracy(attempts: Attempt[], questions: Question[], minAnswers = 1): ConceptStat[] {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const stats = new Map<string, ConceptStat>()
  for (const attempt of attempts) {
    for (const id of attempt.question_ids) {
      const q = byId.get(id)
      if (!q) continue
      const right = isCorrect(q, attempt.responses[id] ?? [])
      for (const concept of q.concepts) {
        const s = stats.get(concept) ?? { concept, domain: q.domain, correct: 0, total: 0 }
        s.total++
        if (right) s.correct++
        stats.set(concept, s)
      }
    }
  }
  return [...stats.values()]
    .filter((s) => s.total >= minAnswers)
    .sort((a, b) => a.correct / a.total - b.correct / b.total || b.total - a.total)
}
