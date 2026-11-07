import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildIndex } from '../../scripts/build-index.ts'

const domains = [{ id: 'd1', name: 'D1', weight: 100, description: 'd', walkthroughId: null, labId: null }]
const question = (id: string, review_status: 'draft' | 'reviewed') => ({
  id,
  domain: 'd1',
  difficulty: 'easy',
  type: 'single',
  question: 'Which?',
  options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: key })),
  answer: ['A'],
  explanation: { correct: 'A', distractors: { B: 'no', C: 'no', D: 'no' } },
  concepts: ['c'],
  source: 'original',
  sources: [],
  review_status,
  reviewed_by: review_status === 'reviewed' ? 'r' : null,
  reviewed_at: review_status === 'reviewed' ? '2026-11-07' : null,
})

function contentDir(questions: unknown[]) {
  const dir = mkdtempSync(join(tmpdir(), 'cca-content-'))
  mkdirSync(join(dir, 'questions'))
  writeFileSync(join(dir, 'domains.json'), JSON.stringify(domains))
  writeFileSync(join(dir, 'questions', 'd1.json'), JSON.stringify(questions))
  return dir
}

describe('buildIndex', () => {
  it('includes reviewed questions and leaves drafts out', () => {
    const index = buildIndex(contentDir([question('d1-001', 'reviewed'), question('d1-002', 'draft')]))
    expect(index.questions.map((q) => q.id)).toEqual(['d1-001'])
    expect(index.domains.map((d) => d.id)).toEqual(['d1'])
  })

  it('refuses to build from invalid content', () => {
    expect(() => buildIndex(contentDir([{ id: 'd1-001' }]))).toThrow('Content is invalid')
  })
})
