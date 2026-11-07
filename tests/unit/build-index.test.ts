import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildIndex, contentFiles } from '../../scripts/build-index.ts'

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
  published_at: review_status === 'reviewed' ? '2026-11-07' : null,
})

function contentDir(questions: unknown[]) {
  const dir = mkdtempSync(join(tmpdir(), 'cca-content-'))
  mkdirSync(join(dir, 'bank'))
  writeFileSync(join(dir, 'domains.json'), JSON.stringify(domains))
  writeFileSync(join(dir, 'bank', 'questions.json'), JSON.stringify({ version: 1, published_at: '2026-11-07', questions }))
  return dir
}

describe('buildIndex', () => {
  it('includes reviewed questions and leaves drafts out', () => {
    const index = buildIndex(contentDir([question('d1-001', 'reviewed'), question('d1-002', 'draft')]))
    expect(index.questions.map((q) => q.id)).toEqual(['d1-001'])
    expect(index.domains.map((d) => d.id)).toEqual(['d1'])
  })

  it('exposes the bank version and publish date', () => {
    const index = buildIndex(contentDir([question('d1-001', 'reviewed')]))
    expect(index.bank).toEqual({ version: 1, published_at: '2026-11-07' })
  })

  it('refuses to build from invalid content', () => {
    expect(() => buildIndex(contentDir([{ id: 'd1-001' }]))).toThrow('Content is invalid')
  })

  it('watches only files that exist, ignoring stray entries such as .DS_Store', () => {
    const dir = contentDir([question('d1-001', 'reviewed')])
    mkdirSync(join(dir, 'labs', 'd1'), { recursive: true })
    writeFileSync(join(dir, 'labs', 'd1', 'README.md'), '# Lab\n')
    writeFileSync(join(dir, 'labs', '.DS_Store'), '')
    expect(contentFiles(dir).map((f) => f.slice(dir.length))).toEqual([
      '/domains.json',
      '/bank/questions.json',
      '/labs/d1/README.md',
    ])
  })

  it('renders walkthrough sections and lab READMEs, one heading level down', () => {
    const dir = contentDir([question('d1-001', 'reviewed')])
    writeFileSync(
      join(dir, 'domains.json'),
      JSON.stringify([{ ...domains[0], walkthroughId: 'd1', labId: 'd1-lab' }]),
    )
    mkdirSync(join(dir, 'walkthroughs'))
    writeFileSync(join(dir, 'walkthroughs', 'd1.md'), '# D1\n\nIntro.\n\n## Loops\n<!-- concepts: c -->\n\n### Core\n\nText.\n')
    mkdirSync(join(dir, 'labs', 'd1'), { recursive: true })
    writeFileSync(join(dir, 'labs', 'd1', 'README.md'), '# Lab\n\nRun `npm run check`.\n')

    const index = buildIndex(dir)
    expect(index.walkthroughs).toHaveLength(1)
    const [section] = index.walkthroughs[0].sections
    expect(section).toMatchObject({ anchor: 'wt-d1-loops', title: 'Loops', concepts: ['c'] })
    expect(section.html).toContain('<h4>Core</h4>')
    expect(index.labs).toEqual([{ domainId: 'd1', labId: 'd1-lab', html: expect.stringContaining('<h2>Lab</h2>') }])
  })
})
