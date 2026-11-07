import { describe, expect, it } from 'vitest'
import { parseRoute } from '../../src/lib/route.ts'
import { parseWalkthrough, sectionAnchor } from '../../src/lib/walkthrough.ts'
import { checkContent } from '../../scripts/validate-content.ts'

const markdown = `# Domain One

Intro text.

## Agentic loops
<!-- concepts: stop_reason, agentic-loop -->

### Core concepts

- A point.

## Hooks & matchers
<!--concepts:hook-matchers-->
Body.

## Next steps

- [Drill](#drill)
`

const bank = (questions: unknown[]) => ({ version: 1, published_at: '2026-11-07', questions })

describe('parseWalkthrough', () => {
  it('splits sections and reads their concept lists', () => {
    const w = parseWalkthrough(markdown)
    expect(w.title).toBe('Domain One')
    expect(w.intro).toBe('Intro text.')
    expect(w.sections.map((s) => [s.slug, s.concepts])).toEqual([
      ['agentic-loops', ['stop_reason', 'agentic-loop']],
      ['hooks-matchers', ['hook-matchers']],
      ['next-steps', []],
    ])
    expect(w.sections[0].body).toContain('### Core concepts')
    expect(sectionAnchor('d1', 'hooks-matchers')).toBe('wt-d1-hooks-matchers')
  })
})

describe('parseRoute', () => {
  it.each([
    ['', { page: 'drill' }],
    ['#drill', { page: 'drill' }],
    ['#exam', { page: 'exam' }],
    ['#progress', { page: 'progress' }],
    ['#walkthrough', { page: 'walkthrough' }],
    ['#walkthrough-d1', { page: 'walkthrough', domainId: 'd1' }],
    ['#wt-d1-agentic-loops', { page: 'walkthrough', domainId: 'd1', anchor: 'wt-d1-agentic-loops' }],
    ['#lab', { page: 'lab' }],
    ['#lab-d1', { page: 'lab', domainId: 'd1' }],
    ['#unknown', { page: 'drill' }],
  ])('%s', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route)
  })
})

describe('checkContent with walkthroughs and labs', () => {
  const domains = (extra: Record<string, unknown>) => [
    { id: 'd1', name: 'D1', weight: 100, description: 'd', walkthroughId: null, labId: null, ...extra },
  ]
  const question = (concepts: string[]) => ({
    id: 'd1-001',
    domain: 'd1',
    difficulty: 'easy',
    type: 'single',
    question: 'Which?',
    options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: key })),
    answer: ['A'],
    explanation: { correct: 'A', distractors: { B: 'no', C: 'no', D: 'no' } },
    concepts,
    source: 'original',
    sources: [],
    review_status: 'draft',
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
  })

  it('passes when every concept is covered and the files exist', () => {
    const report = checkContent(
      domains({ walkthroughId: 'd1', labId: 'd1-lab' }),
      bank([question(['stop_reason', 'hook-matchers'])]),
      { walkthroughs: { d1: markdown }, labs: { d1: '# Lab' } },
    )
    expect(report.errors).toEqual([])
  })

  it('reports a concept no section explains', () => {
    const report = checkContent(domains({ walkthroughId: 'd1' }), bank([question(['sessions'])]), {
      walkthroughs: { d1: markdown },
      labs: {},
    })
    expect(report.errors).toEqual(['walkthroughs/d1.md: no section lists concept "sessions" (used by d1-001)'])
  })

  it('reports missing walkthrough and lab files', () => {
    const report = checkContent(domains({ walkthroughId: 'd1', labId: 'd1-lab' }), bank([]), { walkthroughs: {}, labs: {} })
    expect(report.errors).toEqual([
      'domains.json: d1 has labId but no content/labs/d1/README.md',
      'domains.json: d1 has no content/walkthroughs/d1.md',
    ])
  })

  it('skips concept checks for domains without a walkthrough', () => {
    expect(checkContent(domains({}), bank([question(['anything'])])).errors).toEqual([])
  })
})
