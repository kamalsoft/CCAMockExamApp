import { selectQuestions } from './drill.ts'
import type { Domain, Question } from './schema.ts'

// From the official exam guide v1.0, §3; see content/blueprint.md.
export const EXAM_ITEMS = 60
export const EXAM_MINUTES = 120

export type Shortfall = { domainId: string; target: number; available: number }

// Splits `total` items across domains by weight using largest remainders, so the counts sum exactly to `total`.
export function domainTargets(domains: Domain[], total: number): Record<string, number> {
  const exact = domains.map((d) => {
    if (d.weight === 'TODO') throw new Error(`Domain ${d.id} has no weight yet; see content/blueprint.md`)
    return { id: d.id, value: (d.weight / 100) * total }
  })
  const targets = Object.fromEntries(exact.map((e) => [e.id, Math.floor(e.value)]))
  let left = total - Object.values(targets).reduce((a, b) => a + b, 0)
  for (const e of [...exact].sort((a, b) => (b.value % 1) - (a.value % 1))) {
    if (left-- <= 0) break
    targets[e.id]++
  }
  return targets
}

export function assembleExam(questions: Question[], domains: Domain[], total = EXAM_ITEMS, random = Math.random) {
  const targets = domainTargets(domains, total)
  const picked: Question[] = []
  const shortfall: Shortfall[] = []
  for (const [domainId, target] of Object.entries(targets)) {
    const available = selectQuestions(questions, [domainId], 'any', random)
    picked.push(...available.slice(0, target))
    if (available.length < target) shortfall.push({ domainId, target, available: available.length })
  }
  // Mix domains so the exam doesn't run domain by domain.
  return { questions: selectQuestions(picked, Object.keys(targets), 'any', random), shortfall }
}

export function remainingSeconds(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000))
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
