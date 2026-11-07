import type { Attempt, Progress } from './progress.ts'
import type { Domain } from './schema.ts'

// Practice targets chosen for this app (PLAN.md, Milestone 7). The real exam reports a scaled score
// (720 of 100–1,000 passes), which does not convert to a percentage of correct answers.
export const PASS_MARK = 0.75
export const DOMAIN_TARGET = 0.65
export const REQUIRED_EXAMS = 3

export type Condition = { id: string; label: string; met: boolean; detail: string }

const pct = (n: number) => `${Math.round(n * 100)}%`
export const examScore = (a: Attempt) => {
  const s = Object.values(a.score_by_domain)
  return s.reduce((n, d) => n + d.correct, 0) / Math.max(1, s.reduce((n, d) => n + d.total, 0))
}

/** Readiness is judged on the most recent full mock exams, plus every lab and walkthrough. */
export function readiness(progress: Progress, domains: Domain[]): { ready: boolean; conditions: Condition[] } {
  const recent = progress.attempts.filter((a) => a.mode === 'exam' && a.full).slice(-REQUIRED_EXAMS)
  const failing = recent.filter((a) => examScore(a) < PASS_MARK)
  const weak = recent.flatMap((a, i) =>
    Object.entries(a.score_by_domain)
      .filter(([, s]) => s.total > 0 && s.correct / s.total < DOMAIN_TARGET)
      .map(([id, s]) => `${domains.find((d) => d.id === id)?.name ?? id} at ${pct(s.correct / s.total)} (exam ${i + 1})`),
  )
  const labsLeft = domains.filter((d) => d.labId && !progress.labsCompleted[d.id]).map((d) => d.name)
  const readingLeft = domains.filter((d) => d.walkthroughId && !progress.walkthroughsSeen[d.id]).map((d) => d.name)

  const conditions: Condition[] = [
    {
      id: 'exams',
      label: `Take at least ${REQUIRED_EXAMS} full mock exams`,
      met: recent.length >= REQUIRED_EXAMS,
      detail: `${recent.length} of ${REQUIRED_EXAMS} completed`,
    },
    {
      id: 'pass',
      label: `Score at least ${pct(PASS_MARK)} on each of them`,
      met: recent.length >= REQUIRED_EXAMS && failing.length === 0,
      detail: recent.length ? `Scores: ${recent.map((a) => pct(examScore(a))).join(', ')}` : 'No full exams yet',
    },
    {
      id: 'domains',
      label: `Keep every domain at ${pct(DOMAIN_TARGET)} or above`,
      met: recent.length >= REQUIRED_EXAMS && weak.length === 0,
      detail: weak.length ? `Below target: ${weak.join('; ')}` : recent.length ? 'No domain below target' : 'No full exams yet',
    },
    {
      id: 'labs',
      label: 'Complete every lab',
      met: labsLeft.length === 0,
      detail: labsLeft.length ? `Not yet: ${labsLeft.join(', ')}` : 'All labs complete',
    },
    {
      id: 'walkthroughs',
      label: 'Read every walkthrough',
      met: readingLeft.length === 0,
      detail: readingLeft.length ? `Not yet: ${readingLeft.join(', ')}` : 'All walkthroughs read',
    },
  ]
  return { ready: conditions.every((c) => c.met), conditions }
}
