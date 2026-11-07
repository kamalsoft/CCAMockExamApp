import { describe, expect, it } from 'vitest'
import { isCorrect, scoreByDomain, selectQuestions } from '../../src/lib/drill.ts'
import type { Question } from '../../src/lib/schema.ts'

const question = (id: string, domain: string, difficulty: Question['difficulty'], answer = ['B']): Question => ({
  id,
  domain,
  difficulty,
  type: answer.length > 1 ? 'multi' : 'single',
  question: 'Which option?',
  options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: key })),
  answer,
  explanation: { correct: 'why', distractors: {} },
  concepts: ['c'],
  source: 'original',
  sources: [],
  review_status: 'reviewed',
  reviewed_by: 'r',
  reviewed_at: '2026-11-07', published_at: '2026-11-07',
})

const bank = [
  question('d1-001', 'd1', 'easy'),
  question('d1-002', 'd1', 'hard'),
  question('d2-001', 'd2', 'easy'),
  question('d3-001', 'd3', 'hard'),
]
const ids = (qs: Question[]) => qs.map((q) => q.id).sort()

describe('selectQuestions', () => {
  it('filters by domain and difficulty', () => {
    expect(ids(selectQuestions(bank, ['d1', 'd2'], 'easy'))).toEqual(['d1-001', 'd2-001'])
  })

  it('keeps every difficulty for "any"', () => {
    expect(ids(selectQuestions(bank, ['d1'], 'any'))).toEqual(['d1-001', 'd1-002'])
  })

  it('returns nothing when no domain is chosen', () => {
    expect(selectQuestions(bank, [], 'any')).toEqual([])
  })

  it('shuffles without mutating the bank', () => {
    const before = ids(bank)
    const picked = selectQuestions(bank, ['d1', 'd2', 'd3'], 'any', () => 0)
    expect(picked.map((q) => q.id)).not.toEqual(bank.map((q) => q.id))
    expect(ids(picked)).toEqual(before)
    expect(bank.map((q) => q.id)).toEqual(['d1-001', 'd1-002', 'd2-001', 'd3-001'])
  })
})

describe('isCorrect', () => {
  it('checks single answers', () => {
    expect(isCorrect(bank[0], ['B'])).toBe(true)
    expect(isCorrect(bank[0], ['A'])).toBe(false)
    expect(isCorrect(bank[0], [])).toBe(false)
  })

  it('needs every multi answer in any order, and nothing extra', () => {
    const multi = question('d1-003', 'd1', 'medium', ['B', 'D'])
    expect(isCorrect(multi, ['D', 'B'])).toBe(true)
    expect(isCorrect(multi, ['B'])).toBe(false)
    expect(isCorrect(multi, ['B', 'D', 'A'])).toBe(false)
  })
})

describe('scoreByDomain', () => {
  it('counts correct answers per domain, treating unanswered as wrong', () => {
    expect(scoreByDomain(bank, { 'd1-001': ['B'], 'd1-002': ['A'], 'd2-001': ['B'] })).toEqual({
      d1: { correct: 1, total: 2 },
      d2: { correct: 1, total: 1 },
      d3: { correct: 0, total: 1 },
    })
  })
})
