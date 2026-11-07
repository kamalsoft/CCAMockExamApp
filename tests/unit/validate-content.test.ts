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
  ...overrides,
})

describe('checkContent', () => {
  it('accepts valid domains and questions', () => {
    expect(checkContent(domains, { 'd1.json': [question()] })).toEqual({ errors: [], warnings: [] })
  })

  it('warns, but does not fail, on TODO weights', () => {
    const report = checkContent([domain('d1', 'TODO'), domain('d2', 40)], {})
    expect(report.errors).toEqual([])
    expect(report.warnings).toEqual([expect.stringContaining('TODO for d1')])
  })

  it('fails when weights do not sum to 100', () => {
    expect(checkContent([domain('d1', 60), domain('d2', 30)], {}).errors).toEqual([
      'domains.json: weights sum to 90, expected 100',
    ])
  })

  it('fails on duplicate domain ids', () => {
    expect(checkContent([domain('d1', 50), domain('d1', 50)], {}).errors).toEqual([
      'domains.json: domain ids must be unique',
    ])
  })

  it('fails when a wrong option has no explanation', () => {
    const q = question({ explanation: { correct: 'B', distractors: { A: 'no', C: 'no' } } })
    expect(checkContent(domains, { 'd1.json': [q] }).errors).toEqual([
      'questions/d1.json[0].explanation: missing explanation for wrong option "D"',
    ])
  })

  it('fails when the correct option is explained as a distractor', () => {
    const q = question({ explanation: { correct: 'B', distractors: { A: 'no', B: 'no', C: 'no', D: 'no' } } })
    expect(checkContent(domains, { 'd1.json': [q] }).errors).toEqual([
      'questions/d1.json[0].explanation: "B" is not a wrong option',
    ])
  })

  it('fails on answer count that does not match type', () => {
    const errors = checkContent(domains, { 'd1.json': [question({ answer: ['A', 'B'] })] }).errors
    expect(errors).toContain('questions/d1.json[0].answer: single questions need exactly one answer')
  })

  it('fails on an answer that is not an option', () => {
    const errors = checkContent(domains, { 'd1.json': [question({ answer: ['E'] })] }).errors
    expect(errors).toContain('questions/d1.json[0].answer: answer "E" is not an option key')
  })

  it('fails reviewed questions without reviewer details', () => {
    expect(checkContent(domains, { 'd1.json': [question({ review_status: 'reviewed' })] }).errors).toEqual([
      'questions/d1.json[0].review_status: reviewed questions need reviewed_by and reviewed_at',
    ])
  })

  it('fails on duplicate ids, wrong file, and unknown domain file', () => {
    const errors = checkContent(domains, {
      'd1.json': [question(), question()],
      'd2.json': [question({ id: 'd1-002' })],
      'd9.json': [],
    }).errors
    expect(errors).toEqual([
      'd1-001: duplicate question id',
      'd1-002: domain "d1" does not match file d2.json',
      'questions/d9.json: no domain "d9" in domains.json',
    ])
  })
})
