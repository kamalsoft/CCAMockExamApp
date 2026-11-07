import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import type { Claim } from '../src/reliability.ts'

// LAB_SOLUTION=1 runs the same tests against the reference solution.
const { synthesize, routeForReview, stratifiedSample } = await import(
  process.env.LAB_SOLUTION ? '../solution/reliability.ts' : '../src/reliability.ts'
)

const f = (claim: string, value: string, source: string, date: string) => ({ claim, value, source, date })
const claimOf = (result: { claims: Claim[] }, claim: string) => result.claims.find((c) => c.claim === claim)

describe('Part 1: synthesize', () => {
  test('agreeing sources make a claim established, and every source is kept', () => {
    const result = synthesize([f('ev-share', '18%', 'iea.org', '2025'), f('ev-share', '18%', 'agency.gov', '2025')], [])
    assert.deepEqual(claimOf(result, 'ev-share'), {
      claim: 'ev-share',
      status: 'established',
      values: [{ value: '18%', date: '2025', sources: ['iea.org', 'agency.gov'] }],
    })
  })

  test('one source alone is single-source', () => {
    const result = synthesize([f('battery-cost', '$95/kWh', 'report.pdf', '2025')], [])
    assert.equal(claimOf(result, 'battery-cost')?.status, 'single-source')
  })

  test('conflicting values from the same period are contested, with both values and sources kept', () => {
    const result = synthesize([f('market-share', '23%', 'a.com', '2025'), f('market-share', '31%', 'b.com', '2025')], [])
    const claim = claimOf(result, 'market-share')
    assert.equal(claim?.status, 'contested')
    assert.deepEqual(claim?.values.map((v: { value: string }) => v.value).sort(), ['23%', '31%'], 'never average or drop a value')
  })

  test('different values from different years are a trend, sorted by date', () => {
    const result = synthesize([f('chargers', '95,000', 'new.org', '2025'), f('chargers', '40,000', 'old.org', '2021')], [])
    const claim = claimOf(result, 'chargers')
    assert.equal(claim?.status, 'trend')
    assert.deepEqual(claim?.values.map((v: { date: string }) => v.date), ['2021', '2025'])
  })

  test('reports failed sources as coverage gaps', () => {
    assert.deepEqual(synthesize([], ['journals-agent']).gaps, ['journals-agent'])
  })
})

describe('Part 2: routeForReview', () => {
  const thresholds = { invoice_number: 0.8, line_items: 0.97 }

  test('lets an extraction through when every field clears its own threshold', () => {
    const r = routeForReview({ fields: { invoice_number: { value: 'INV-1', confidence: 0.85 }, line_items: { value: [], confidence: 0.98 } } }, thresholds)
    assert.deepEqual(r, { route: 'auto', reasons: [] })
  })

  test('uses each field\'s calibrated threshold, not a single global one', () => {
    const r = routeForReview({ fields: { invoice_number: { value: 'INV-1', confidence: 0.85 }, line_items: { value: [], confidence: 0.9 } } }, thresholds)
    assert.equal(r.route, 'human')
    assert.equal(r.reasons.length, 1)
    assert.match(r.reasons[0], /line_items/)
  })

  test('sends contradictory sources and uncalibrated fields to a person', () => {
    const conflict = routeForReview({ fields: { invoice_number: { value: 'INV-1', confidence: 0.99 } }, conflict_detected: true }, thresholds)
    assert.equal(conflict.route, 'human')
    const uncalibrated = routeForReview({ fields: { po_number: { value: 'PO-9', confidence: 0.99 } } }, thresholds)
    assert.equal(uncalibrated.route, 'human')
    assert.match(uncalibrated.reasons[0], /po_number/)
  })
})

describe('Part 3: stratifiedSample', () => {
  const items = [
    ...Array.from({ length: 50 }, (_, i) => ({ id: `typed-${i}`, stratum: 'typed-invoice' })),
    ...Array.from({ length: 6 }, (_, i) => ({ id: `hand-${i}`, stratum: 'handwritten-receipt' })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `fax-${i}`, stratum: 'fax' })),
  ]
  // A repeatable pseudo-random generator for the tests.
  const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  test('samples every stratum, including small ones, up to the limit', () => {
    const sample = stratifiedSample(items, 3, seeded(42))
    const count = (prefix: string) => sample.filter((id: string) => id.startsWith(prefix)).length
    assert.deepEqual([count('typed-'), count('hand-'), count('fax-')], [3, 3, 2])
    assert.equal(new Set(sample).size, sample.length, 'never pick an id twice')
  })

  test('picks at random within a stratum rather than taking the first items', () => {
    const picks = new Set(Array.from({ length: 5 }, (_, s) => stratifiedSample(items, 3, seeded(s + 1)).join(',')))
    assert.ok(picks.size > 1, 'different random sequences should give different samples')
  })
})
