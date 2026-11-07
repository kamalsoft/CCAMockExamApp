import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

// LAB_SOLUTION=1 runs the same tests against the reference solution.
const { runAgent, requirePrerequisite } = await import(
  process.env.LAB_SOLUTION ? '../solution/agent.ts' : '../src/agent.ts'
)

type Block = Record<string, unknown>
const text = (t: string): Block => ({ type: 'text', text: t })
const toolUse = (id: string, name: string, input: Block = {}): Block => ({ type: 'tool_use', id, name, input })
const response = (stop_reason: string, content: Block[]) => ({ stop_reason, content })

// A fake model that replies from a script and records every conversation it was sent.
function fakeModel(script: ReturnType<typeof response>[]) {
  const sent: unknown[][] = []
  const send = async (messages: unknown[]) => {
    sent.push(structuredClone(messages))
    const next = script.shift()
    if (!next) throw new Error('send() was called more times than the test expected')
    return next
  }
  return { send, sent }
}

function recordingTools(results: Record<string, string | Error> = {}) {
  const calls: [string, unknown][] = []
  const executeTool = async (name: string, input: unknown) => {
    calls.push([name, input])
    const result = results[name] ?? `${name} ok`
    if (result instanceof Error) throw result
    return result
  }
  return { executeTool, calls }
}

describe('Part 1: runAgent', () => {
  test('returns the final text when Claude ends its turn', async () => {
    const { send, sent } = fakeModel([response('end_turn', [text('All done.')])])
    const result = await runAgent({ send, executeTool: recordingTools().executeTool, prompt: 'Hi' })
    assert.equal(result.status, 'done')
    assert.equal(result.text, 'All done.')
    assert.equal(result.turns, 1)
    assert.deepEqual(sent[0], [{ role: 'user', content: 'Hi' }])
  })

  test('runs every requested tool and returns all results in one user message', async () => {
    const first = response('tool_use', [
      text('Checking both.'),
      toolUse('t1', 'lookup', { id: 1 }),
      toolUse('t2', 'lookup', { id: 2 }),
    ])
    const { send, sent } = fakeModel([first, response('end_turn', [text('Found both.')])])
    const tools = recordingTools({ lookup: 'found' })
    const result = await runAgent({ send, executeTool: tools.executeTool, prompt: 'Find 1 and 2' })

    assert.equal(result.status, 'done')
    assert.deepEqual(tools.calls, [['lookup', { id: 1 }], ['lookup', { id: 2 }]])
    const [, assistant, results] = sent[1] as Block[]
    assert.deepEqual(assistant, { role: 'assistant', content: first.content }, 'append the whole response content')
    assert.deepEqual(results, {
      role: 'user',
      content: [
        { type: 'tool_result', tool_use_id: 't1', content: 'found' },
        { type: 'tool_result', tool_use_id: 't2', content: 'found' },
      ],
    })
  })

  test('reports a failing tool with is_error and keeps going', async () => {
    const { send, sent } = fakeModel([
      response('tool_use', [toolUse('t1', 'flaky')]),
      response('end_turn', [text('Recovered.')]),
    ])
    const tools = recordingTools({ flaky: new Error('timeout') })
    const result = await runAgent({ send, executeTool: tools.executeTool, prompt: 'Go' })
    assert.equal(result.status, 'done')
    const last = (sent[1] as Block[]).at(-1)
    assert.deepEqual(last, {
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: 't1', content: 'timeout', is_error: true }],
    })
  })

  test('does not run tools from a truncated response', async () => {
    const { send } = fakeModel([response('max_tokens', [text('Saving'), toolUse('t1', 'save', { body: 'cut of' })])])
    const tools = recordingTools()
    const result = await runAgent({ send, executeTool: tools.executeTool, prompt: 'Write it' })
    assert.equal(result.status, 'truncated')
    assert.deepEqual(tools.calls, [])
  })

  test('reports a refusal', async () => {
    const { send } = fakeModel([response('refusal', [])])
    const result = await runAgent({ send, executeTool: recordingTools().executeTool, prompt: 'x' })
    assert.equal(result.status, 'refusal')
  })

  test('continues after pause_turn without adding a user message', async () => {
    const paused = response('pause_turn', [text('Still searching')])
    const { send, sent } = fakeModel([paused, response('end_turn', [text('Done')])])
    const result = await runAgent({ send, executeTool: recordingTools().executeTool, prompt: 'Search' })
    assert.equal(result.status, 'done')
    assert.deepEqual(sent[1], [{ role: 'user', content: 'Search' }, { role: 'assistant', content: paused.content }])
  })

  test('stops at the turn limit as a backstop', async () => {
    const loop = () => response('tool_use', [toolUse('t', 'again')])
    const { send } = fakeModel([loop(), loop(), loop()])
    const result = await runAgent({ send, executeTool: recordingTools().executeTool, prompt: 'Go', maxTurns: 3 })
    assert.equal(result.status, 'turn_limit')
    assert.equal(result.turns, 3)
  })
})

describe('Part 2: requirePrerequisite', () => {
  const rule = { tool: 'approve_expense', requires: 'verify_receipt', key: 'expense_id' }

  test('blocks the guarded tool until its prerequisite succeeds for the same id', async () => {
    const tools = recordingTools()
    const gated = requirePrerequisite(tools.executeTool, rule)

    await assert.rejects(gated('approve_expense', { expense_id: 'E1' }), /^Error: Blocked:/)
    assert.deepEqual(tools.calls, [], 'a blocked call must never reach the real tool')

    await gated('verify_receipt', { expense_id: 'E1' })
    assert.equal(await gated('approve_expense', { expense_id: 'E1' }), 'approve_expense ok')
    await assert.rejects(gated('approve_expense', { expense_id: 'E2' }), /Blocked:/)
  })

  test('a failed prerequisite does not unlock the guarded tool', async () => {
    const gated = requirePrerequisite(recordingTools({ verify_receipt: new Error('unreadable receipt') }).executeTool, rule)
    await assert.rejects(gated('verify_receipt', { expense_id: 'E1' }), /unreadable receipt/)
    await assert.rejects(gated('approve_expense', { expense_id: 'E1' }), /Blocked:/)
  })

  test('other tools pass through unchanged', async () => {
    const gated = requirePrerequisite(recordingTools().executeTool, rule)
    assert.equal(await gated('list_expenses', {}), 'list_expenses ok')
  })

  test('inside the loop, a blocked call reaches Claude as an error result', async () => {
    const { send, sent } = fakeModel([
      response('tool_use', [toolUse('t1', 'approve_expense', { expense_id: 'E1' })]),
      response('end_turn', [text('I need to verify the receipt first.')]),
    ])
    const gated = requirePrerequisite(recordingTools().executeTool, rule)
    const result = await runAgent({ send, executeTool: gated, prompt: 'Approve E1' })
    assert.equal(result.status, 'done')
    const blocked = ((sent[1] as Block[]).at(-1) as { content: Block[] }).content[0]
    assert.equal(blocked.is_error, true)
    assert.match(String(blocked.content), /^Blocked:/)
  })
})
