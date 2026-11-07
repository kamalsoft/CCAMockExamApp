import { describe, expect, it } from 'vitest'
import { assembleExam, domainTargets, formatTime, remainingSeconds } from '../../src/lib/exam.ts'
import type { Domain, Question } from '../../src/lib/schema.ts'

const domain = (id: string, weight: number | 'TODO'): Domain => ({
  id,
  name: id,
  weight,
  description: 'd',
  walkthroughId: null,
  labId: null,
})
const official = [domain('d1', 27), domain('d2', 18), domain('d3', 20), domain('d4', 20), domain('d5', 15)]

const question = (id: string, domainId: string): Question => ({
  id,
  domain: domainId,
  difficulty: 'easy',
  type: 'single',
  question: 'q',
  options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: key })),
  answer: ['A'],
  explanation: { correct: 'c', distractors: {} },
  concepts: ['c'],
  source: 'original',
  sources: [],
  review_status: 'reviewed',
  reviewed_by: 'r',
  reviewed_at: '2026-11-07',
})
const bank = (domainId: string, n: number) =>
  Array.from({ length: n }, (_, i) => question(`${domainId}-${String(i + 1).padStart(3, '0')}`, domainId))

describe('domainTargets', () => {
  it('splits 60 items by the official weights, summing exactly to 60', () => {
    // 16.2, 10.8, 12, 12, 9: the 0.8 remainder (d2) gets the leftover item.
    expect(domainTargets(official, 60)).toEqual({ d1: 16, d2: 11, d3: 12, d4: 12, d5: 9 })
  })

  it('always sums to the total', () => {
    for (const total of [1, 7, 13, 59, 61]) {
      const sum = Object.values(domainTargets(official, total)).reduce((a, b) => a + b, 0)
      expect(sum).toBe(total)
    }
  })

  it('refuses domains whose weight is still TODO', () => {
    expect(() => domainTargets([domain('d1', 'TODO')], 60)).toThrow('d1 has no weight yet')
  })
})

describe('assembleExam', () => {
  it('fills every domain target when the bank is large enough', () => {
    const questions = official.flatMap((d) => bank(d.id, 20))
    const exam = assembleExam(questions, official)
    expect(exam.questions).toHaveLength(60)
    expect(exam.shortfall).toEqual([])
    expect(new Set(exam.questions.map((q) => q.id)).size).toBe(60)
    expect(exam.questions.filter((q) => q.domain === 'd2')).toHaveLength(11)
  })

  it('reports domains that are short and uses what exists', () => {
    const exam = assembleExam([...bank('d1', 30), ...bank('d2', 4)], official)
    expect(exam.questions.filter((q) => q.domain === 'd1')).toHaveLength(16)
    expect(exam.questions.filter((q) => q.domain === 'd2')).toHaveLength(4)
    expect(exam.shortfall).toEqual([
      { domainId: 'd2', target: 11, available: 4 },
      { domainId: 'd3', target: 12, available: 0 },
      { domainId: 'd4', target: 12, available: 0 },
      { domainId: 'd5', target: 9, available: 0 },
    ])
  })
})

describe('timer helpers', () => {
  it('counts down whole seconds and never goes below zero', () => {
    expect(remainingSeconds(10_000, 0)).toBe(10)
    expect(remainingSeconds(10_000, 9_001)).toBe(1)
    expect(remainingSeconds(10_000, 10_000)).toBe(0)
    expect(remainingSeconds(10_000, 99_000)).toBe(0)
  })

  it('formats with hours only when needed', () => {
    expect(formatTime(7200)).toBe('2:00:00')
    expect(formatTime(3599)).toBe('59:59')
    expect(formatTime(5)).toBe('00:05')
  })
})
