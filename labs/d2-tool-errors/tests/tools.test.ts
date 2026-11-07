import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

// LAB_SOLUTION=1 runs the same tests against the reference solution.
const { searchCustomers, callWithRetry, BackendError } = await import(
  process.env.LAB_SOLUTION ? '../solution/tools.ts' : '../src/tools.ts'
)

const ada = { id: 'c1', name: 'Ada Lovelace', email: 'ada@example.com' }

// A fake backend that records queries and either returns customers or throws.
function backend(outcome: unknown[] | Error) {
  const queries: string[] = []
  return {
    queries,
    async search(query: string) {
      queries.push(query)
      if (outcome instanceof Error) throw outcome
      return outcome
    },
  }
}

function errorOf(result: { content: { text: string }[]; isError: boolean }) {
  assert.equal(result.isError, true, 'a failure must set isError: true')
  assert.equal(result.content.length, 1, 'use exactly one text block')
  return JSON.parse(result.content[0].text)
}

describe('Part 1: searchCustomers', () => {
  test('returns matches as JSON with isError false', async () => {
    const result = await searchCustomers(backend([ada]), { query: 'Ada' })
    assert.equal(result.isError, false)
    assert.deepEqual(JSON.parse(result.content[0].text), { customers: [ada] })
  })

  test('no match is an empty success, not an error', async () => {
    const result = await searchCustomers(backend([]), { query: 'Nobody' })
    assert.equal(result.isError, false)
    assert.deepEqual(JSON.parse(result.content[0].text), { customers: [] })
  })

  test('rejects a missing or too-short query as a validation error without calling the backend', async () => {
    for (const input of [{}, { query: ' a ' }, { query: 42 }]) {
      const b = backend([ada])
      const error = errorOf(await searchCustomers(b, input))
      assert.deepEqual([error.errorCategory, error.isRetryable], ['validation', false], JSON.stringify(input))
      assert.deepEqual(b.queries, [], `backend called for ${JSON.stringify(input)}`)
    }
  })

  test('reports outages as transient and retryable, never as an empty result', async () => {
    for (const failure of [new BackendError(503, 'down'), new BackendError(429, 'slow down'), new BackendError(408, 'timeout'), new TypeError('fetch failed')]) {
      const error = errorOf(await searchCustomers(backend(failure), { query: 'Ada' }))
      assert.equal(error.errorCategory, 'transient', String(failure))
      assert.equal(error.isRetryable, true, String(failure))
      assert.ok(error.message.length > 0, 'include a readable message')
    }
  })

  test('reports 401 and 403 as permission errors that are not retryable', async () => {
    for (const status of [401, 403]) {
      const error = errorOf(await searchCustomers(backend(new BackendError(status, 'no')), { query: 'Ada' }))
      assert.deepEqual([error.errorCategory, error.isRetryable], ['permission', false], `status ${status}`)
    }
  })

  test('reports other client errors as validation errors that are not retryable', async () => {
    const error = errorOf(await searchCustomers(backend(new BackendError(400, 'bad')), { query: 'Ada' }))
    assert.deepEqual([error.errorCategory, error.isRetryable], ['validation', false])
  })
})

describe('Part 2: callWithRetry', () => {
  const ok = { content: [{ type: 'text', text: '{"customers":[]}' }], isError: false }
  const err = (isRetryable: boolean) => ({
    content: [{ type: 'text', text: JSON.stringify({ errorCategory: isRetryable ? 'transient' : 'permission', isRetryable, message: 'x' }) }],
    isError: true,
  })
  const sequence = (...results: unknown[]) => {
    let calls = 0
    return { call: async () => results[Math.min(calls++, results.length - 1)], calls: () => calls }
  }

  test('returns the first success without retrying', async () => {
    const s = sequence(ok)
    assert.deepEqual(await callWithRetry(s.call), { result: ok, attempts: 1 })
  })

  test('retries transient errors until one succeeds', async () => {
    const s = sequence(err(true), err(true), ok)
    assert.deepEqual(await callWithRetry(s.call), { result: ok, attempts: 3 })
  })

  test('stops at maxAttempts and returns the last error', async () => {
    const s = sequence(err(true))
    const { result, attempts } = await callWithRetry(s.call, 4)
    assert.equal(attempts, 4)
    assert.equal(result.isError, true)
    assert.equal(s.calls(), 4)
  })

  test('never retries an error that is not retryable', async () => {
    const s = sequence(err(false), ok)
    assert.deepEqual(await callWithRetry(s.call), { result: err(false), attempts: 1 })
  })
})
