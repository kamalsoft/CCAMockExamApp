import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

// LAB_SOLUTION=1 runs the same tests against the reference solution.
const { validateInvoice, extractWithRetry, pairBatchResults } = await import(
  process.env.LAB_SOLUTION ? '../solution/extraction.ts' : '../src/extraction.ts'
)

const good = {
  invoice_number: 'INV-1001',
  issue_date: '2026-05-03',
  tax_id: null,
  total: 150,
  line_items: [
    { description: 'Design', amount: 100 },
    { description: 'Hosting', amount: 50 },
  ],
}
const fields = (errors: { field: string }[]) => errors.map((e) => e.field).sort()

describe('Part 1: validateInvoice', () => {
  test('accepts a valid invoice, including null for absent optional values', () => {
    assert.deepEqual(validateInvoice(good), [])
  })

  test('reports each malformed field as retryable', () => {
    const errors = validateInvoice({ ...good, invoice_number: '', issue_date: '3rd of May 2026', line_items: 'none' })
    assert.deepEqual(fields(errors), ['invoice_number', 'issue_date', 'line_items'])
    assert.ok(errors.every((e: { retryable: boolean; message: string }) => e.retryable && e.message.length > 0))
  })

  test('rejects anything that is not an object', () => {
    for (const x of [null, 'INV-1', [good]]) {
      assert.deepEqual(fields(validateInvoice(x)), ['*'], JSON.stringify(x))
    }
  })

  test('flags line items that do not add up, without marking it retryable', () => {
    const errors = validateInvoice({ ...good, total: 175 })
    assert.equal(errors.length, 1)
    assert.equal(errors[0].field, 'total')
    assert.equal(errors[0].retryable, false, 'the source document may be wrong; a retry cannot fix it')
  })
})

// A fake model that replies from a script and records what it was sent.
function fakeModel(replies: unknown[]) {
  const sent: { role: string; content: string }[][] = []
  const send = async (messages: { role: string; content: string }[]) => {
    sent.push(structuredClone(messages))
    const next = replies.shift()
    if (next === undefined) throw new Error('send() was called more times than the test expected')
    return typeof next === 'string' ? next : JSON.stringify(next)
  }
  return { send, sent }
}

describe('Part 2: extractWithRetry', () => {
  test('returns at once when the first reply is valid', async () => {
    const { send, sent } = fakeModel([good])
    const result = await extractWithRetry({ send, document: 'Invoice INV-1001 ...' })
    assert.deepEqual(result, { invoice: good, errors: [], attempts: 1 })
    assert.match(sent[0][0].content, /Invoice INV-1001/, 'include the document in the first message')
  })

  test('retries with the failed reply and the specific errors, then succeeds', async () => {
    const bad = { ...good, issue_date: '3rd of May 2026' }
    const { send, sent } = fakeModel([bad, good])
    const result = await extractWithRetry({ send, document: 'Invoice INV-1001 ...' })
    assert.equal(result.attempts, 2)
    assert.deepEqual(result.errors, [])
    const [first, failed, feedback] = sent[1]
    assert.match(first.content, /Invoice INV-1001/, 'keep the document in the conversation')
    assert.deepEqual(failed, { role: 'assistant', content: JSON.stringify(bad) }, 'include the failed extraction')
    assert.equal(feedback.role, 'user')
    assert.match(feedback.content, /issue_date/, 'name the field that failed')
  })

  test('treats a reply that is not JSON as a retryable error', async () => {
    const { send } = fakeModel(['Here is the invoice: {oops', good])
    const result = await extractWithRetry({ send, document: 'doc' })
    assert.equal(result.attempts, 2)
    assert.deepEqual(result.invoice, good)
  })

  test('does not retry when only non-retryable errors remain', async () => {
    const { send } = fakeModel([{ ...good, total: 175 }])
    const result = await extractWithRetry({ send, document: 'doc' })
    assert.equal(result.attempts, 1)
    assert.equal(result.errors[0].retryable, false)
  })

  test('stops at maxAttempts and returns the last errors', async () => {
    const bad = { ...good, invoice_number: '' }
    const { send } = fakeModel([bad, bad])
    const result = await extractWithRetry({ send, document: 'doc', maxAttempts: 2 })
    assert.equal(result.attempts, 2)
    assert.deepEqual(fields(result.errors), ['invoice_number'])
  })
})

describe('Part 3: pairBatchResults', () => {
  test('matches results by custom_id, not by position, and lists what to resubmit', () => {
    const ids = ['doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5']
    const results = [
      { custom_id: 'doc-4', result: { type: 'errored' } },
      { custom_id: 'doc-1', result: { type: 'succeeded' } },
      { custom_id: 'doc-3', result: { type: 'succeeded' } },
      { custom_id: 'doc-2', result: { type: 'expired' } },
    ]
    assert.deepEqual(pairBatchResults(ids, results), {
      succeeded: ['doc-1', 'doc-3'],
      resubmit: ['doc-2', 'doc-4', 'doc-5'],
    })
  })
})
