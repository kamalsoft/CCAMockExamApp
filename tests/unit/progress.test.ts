import { describe, expect, it } from 'vitest'
import {
  conceptAccuracy,
  emptyProgress,
  localStorageRepository,
  makeAttempt,
  recordAttempt,
  type Attempt,
  type Progress,
} from '../../src/lib/progress.ts'
import { readiness } from '../../src/lib/readiness.ts'
import type { Domain, Question } from '../../src/lib/schema.ts'

const memoryStorage = (initial?: string) => {
  const data = new Map<string, string>(initial === undefined ? [] : [['cca-progress-v1', initial]])
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) }
}

const question = (id: string, domain: string, concepts: string[]): Question => ({
  id,
  domain,
  difficulty: 'easy',
  type: 'single',
  question: 'q',
  options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: key })),
  answer: ['A'],
  explanation: { correct: 'c', distractors: {} },
  concepts,
  source: 'original',
  sources: [],
  review_status: 'reviewed',
  reviewed_by: 'r',
  reviewed_at: '2026-11-07',
})

describe('localStorageRepository', () => {
  it('round-trips progress', () => {
    const repo = localStorageRepository(memoryStorage())
    const progress: Progress = { ...emptyProgress(), labsCompleted: { d1: true } }
    repo.save(progress)
    expect(repo.load()).toEqual(progress)
  })

  it('starts fresh when stored data is missing, corrupt, or the wrong shape', () => {
    for (const stored of [undefined, '{not json', '{"attempts": "nope"}']) {
      expect(localStorageRepository(memoryStorage(stored)).load()).toEqual(emptyProgress())
    }
  })

  it('does not throw when storage refuses to save', () => {
    const full = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError') } }
    expect(() => localStorageRepository(full).save(emptyProgress())).not.toThrow()
  })
})

describe('attempts and concept accuracy', () => {
  const qs = [question('d1-001', 'd1', ['loops']), question('d1-002', 'd1', ['loops', 'hooks']), question('d2-001', 'd2', ['mcp'])]

  it('scores an attempt by domain and never records the same attempt twice', () => {
    const attempt = makeAttempt('drill', qs, { 'd1-001': ['A'], 'd1-002': ['B'], 'd2-001': ['A'] }, 1000, false)
    expect(attempt.score_by_domain).toEqual({ d1: { correct: 1, total: 2 }, d2: { correct: 1, total: 1 } })
    const once = recordAttempt(emptyProgress(), attempt)
    expect(recordAttempt(once, attempt).attempts).toHaveLength(1)
  })

  it('ranks concepts weakest first and skips questions no longer in the bank', () => {
    const attempt = makeAttempt('drill', [...qs, question('d9-001', 'd9', ['gone'])], { 'd1-001': ['A'], 'd1-002': ['B'], 'd2-001': ['A'] }, 1, false)
    expect(conceptAccuracy([attempt], qs).map((s) => [s.concept, s.correct, s.total])).toEqual([
      ['hooks', 0, 1],
      ['loops', 1, 2],
      ['mcp', 1, 1],
    ])
  })
})

describe('readiness', () => {
  const domains: Domain[] = ['d1', 'd2'].map((id) => ({
    id, name: id.toUpperCase(), weight: 50, description: 'd', walkthroughId: id, labId: `${id}-lab`,
  }))
  const exam = (d1: [number, number], d2: [number, number], full = true): Attempt => ({
    id: `exam-${Math.random()}`, mode: 'exam', started_at: '', finished_at: '', question_ids: [], responses: {},
    score_by_domain: { d1: { correct: d1[0], total: d1[1] }, d2: { correct: d2[0], total: d2[1] } }, full,
  })
  const done = { labsCompleted: { d1: true, d2: true }, walkthroughsSeen: { d1: 'x', d2: 'x' } }
  const unmet = (p: Progress) => readiness(p, domains).conditions.filter((c) => !c.met).map((c) => c.id)

  it('is ready with three passing full exams, no weak domain, and all labs and walkthroughs done', () => {
    const p = { attempts: [exam([8, 10], [8, 10]), exam([9, 10], [7, 10]), exam([8, 10], [8, 10])], ...done }
    expect(readiness(p, domains).ready).toBe(true)
  })

  it('ignores drills and short exams, and names what is missing', () => {
    const p: Progress = { ...emptyProgress(), attempts: [exam([10, 10], [10, 10], false)] }
    expect(unmet(p)).toEqual(['exams', 'pass', 'domains', 'labs', 'walkthroughs'])
  })

  it('fails on any exam below the pass mark, judged on the three most recent', () => {
    const old = exam([0, 10], [0, 10])
    const passing = [exam([8, 10], [8, 10]), exam([8, 10], [8, 10]), exam([8, 10], [8, 10])]
    expect(unmet({ attempts: [old, ...passing], ...done })).toEqual([])
    expect(unmet({ attempts: [...passing, exam([7, 10], [7, 10])], ...done })).toEqual(['pass'])
  })

  it('fails when any domain falls below its target even if the overall score passes', () => {
    const p = { attempts: [exam([10, 10], [6, 10]), exam([8, 10], [8, 10]), exam([8, 10], [8, 10])], ...done }
    const result = readiness(p, domains)
    expect(unmet(p)).toEqual(['domains'])
    expect(result.conditions.find((c) => c.id === 'domains')?.detail).toContain('D2 at 60% (exam 1)')
  })
})
