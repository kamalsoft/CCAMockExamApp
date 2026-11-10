import { describe, expect, it } from 'vitest'
import { mergeReviewed, type Bank } from '../../src/lib/refresh.ts'
import type { Question } from '../../src/lib/schema.ts'

const question = (id: string, review_status: 'draft' | 'reviewed'): Question =>
  ({
    id,
    domain: 'd1',
    difficulty: 'easy',
    type: 'single',
    question: 'Which?',
    options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: key })),
    answer: ['A'],
    explanation: { correct: 'A', distractors: { B: 'no', C: 'no', D: 'no' } },
    concepts: ['stop_reason'],
    source: 'original',
    sources: [],
    review_status,
    reviewed_by: review_status === 'reviewed' ? 'owner' : null,
    reviewed_at: review_status === 'reviewed' ? '2026-11-01' : null,
    published_at: review_status === 'reviewed' ? '2026-11-01' : null,
  }) as Question

const bank: Bank = { version: 3, published_at: '2026-11-01', questions: [question('d1-001', 'reviewed')] }

describe('mergeReviewed', () => {
  it('adds reviewed drafts, bumps the version, and keeps existing questions', () => {
    const result = mergeReviewed(bank, [question('d1-002', 'reviewed')], '2026-11-10')
    expect(result.added).toEqual(['d1-002'])
    expect(result.bank.version).toBe(4)
    expect(result.bank.published_at).toBe('2026-11-10')
    expect(result.bank.questions.map((q) => q.id)).toEqual(['d1-001', 'd1-002'])
    expect(result.bank.questions[0]).toBe(bank.questions[0])
  })

  it('ignores drafts that are not reviewed, and questions already in the bank', () => {
    const result = mergeReviewed(bank, [question('d1-001', 'reviewed'), question('d1-003', 'draft')], '2026-11-10')
    expect(result.added).toEqual([])
    expect(result.bank).toBe(bank)
  })

  it('adds a repeated id once', () => {
    const result = mergeReviewed(bank, [question('d1-002', 'reviewed'), question('d1-002', 'reviewed')], '2026-11-10')
    expect(result.added).toEqual(['d1-002'])
    expect(result.bank.questions).toHaveLength(2)
  })
})
