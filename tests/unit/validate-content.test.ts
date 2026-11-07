import { describe, expect, it } from 'vitest'
import { checkContent } from '../../scripts/validate-content.ts'

const domain = (id: string, weight: number | 'TODO') => ({
  id,
  name: `Domain ${id}`,
  weight,
  description: 'desc',
  walkthroughId: null,
  labId: null,
})
const domains = [domain('d1', 60), domain('d2', 40)]
const bank = (questions: unknown[] = []) => ({ version: 1, published_at: '2026-11-07', questions })

const question = (overrides: Record<string, unknown> = {}) => ({
  id: 'd1-001',
  domain: 'd1',
  difficulty: 'medium',
  type: 'single',
  question: 'Which option?',
  options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: `Option ${key}` })),
  answer: ['B'],
  explanation: { correct: 'B is right.', distractors: { A: 'no', C: 'no', D: 'no' } },
  concepts: ['concept'],
  source: 'original',
  sources: [],
  review_status: 'draft',
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  ...overrides,
})

const reviewed = (overrides: Record<string, unknown> = {}) =>
  question({ review_status: 'reviewed', reviewed_by: 'r', reviewed_at: '2026-11-07', published_at: '2026-11-07', ...overrides })

describe('checkContent', () => {
  it('accepts a valid bank', () => {
    expect(checkContent(domains, bank([question()]))).toEqual({ errors: [], warnings: [] })
  })

  it('warns, but does not fail, on TODO weights', () => {
    const report = checkContent([domain('d1', 'TODO'), domain('d2', 40)], bank())
    expect(report.errors).toEqual([])
    expect(report.warnings).toEqual([expect.stringContaining('TODO for d1')])
  })

  it('fails when weights do not sum to 100', () => {
    expect(checkContent([domain('d1', 60), domain('d2', 30)], bank()).errors).toEqual([
      'domains.json: weights sum to 90, expected 100',
    ])
  })

  it('fails on duplicate domain ids', () => {
    expect(checkContent([domain('d1', 50), domain('d1', 50)], bank()).errors).toEqual([
      'domains.json: domain ids must be unique',
    ])
  })

  it('fails when the bank has no version or publish date', () => {
    const errors = checkContent(domains, { questions: [] }).errors
    expect(errors).toEqual([
      expect.stringContaining('bank/questions.json.version'),
      expect.stringContaining('bank/questions.json.published_at'),
    ])
  })

  it('fails when a wrong option has no explanation', () => {
    const q = question({ explanation: { correct: 'B', distractors: { A: 'no', C: 'no' } } })
    expect(checkContent(domains, bank([q])).errors).toEqual([
      'bank/questions.json[0].explanation: missing explanation for wrong option "D"',
    ])
  })

  it('fails when the correct option is explained as a distractor', () => {
    const q = question({ explanation: { correct: 'B', distractors: { A: 'no', B: 'no', C: 'no', D: 'no' } } })
    expect(checkContent(domains, bank([q])).errors).toEqual([
      'bank/questions.json[0].explanation: "B" is not a wrong option',
    ])
  })

  it('fails on answer count that does not match type', () => {
    const errors = checkContent(domains, bank([question({ answer: ['A', 'B'] })])).errors
    expect(errors).toContain('bank/questions.json[0].answer: single questions need exactly one answer')
  })

  it('fails on an answer that is not an option', () => {
    const errors = checkContent(domains, bank([question({ answer: ['E'] })])).errors
    expect(errors).toContain('bank/questions.json[0].answer: answer "E" is not an option key')
  })

  it('fails reviewed questions without reviewer details', () => {
    expect(checkContent(domains, bank([reviewed({ reviewed_by: null })])).errors).toEqual([
      'bank/questions.json[0].review_status: reviewed questions need reviewed_by and reviewed_at',
    ])
  })

  it('fails reviewed questions without a publish date, and accepts drafts without one', () => {
    expect(checkContent(domains, bank([reviewed({ published_at: null })])).errors).toEqual([
      'bank/questions.json[0].published_at: reviewed questions need published_at',
    ])
    expect(checkContent(domains, bank([question()])).errors).toEqual([])
  })

  it('fails on duplicate ids and on a domain the bank does not know', () => {
    const errors = checkContent(domains, bank([question(), question(), question({ id: 'd9-001', domain: 'd9' })])).errors
    expect(errors).toEqual([
      'd1-001: duplicate question id',
      'd9-001: no domain "d9" in domains.json',
    ])
  })

  it('accepts an optional hint, and rejects a hint that is not text', () => {
    expect(checkContent(domains, bank([question({ hint: 'Think about the loop.' })])).errors).toEqual([])
    expect(checkContent(domains, bank([question({ hint: 42 })])).errors).toEqual([
      'bank/questions.json[0].hint: Invalid input: expected string, received number',
    ])
  })
})
