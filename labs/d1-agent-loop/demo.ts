// Runs your src/agent.ts against the real Claude API. Needs ANTHROPIC_API_KEY (or `ant auth login`).
import Anthropic from '@anthropic-ai/sdk'
import { requirePrerequisite, runAgent } from './src/agent.ts'

const client = new Anthropic()

const receipts: Record<string, { amount: number; readable: boolean }> = {
  E1: { amount: 42.5, readable: true },
  E2: { amount: 980, readable: false },
}

const tools: Anthropic.Beta.BetaTool[] = [
  {
    name: 'verify_receipt',
    description: 'Checks that the receipt for an expense is readable and matches the claimed amount. Call before approving.',
    input_schema: { type: 'object', properties: { expense_id: { type: 'string' } }, required: ['expense_id'] },
  },
  {
    name: 'approve_expense',
    description: 'Approves an expense for payment. Only valid after verify_receipt has succeeded for the same expense.',
    input_schema: { type: 'object', properties: { expense_id: { type: 'string' } }, required: ['expense_id'] },
  },
]

async function run(name: string, input: unknown): Promise<string> {
  const id = (input as { expense_id: string }).expense_id
  const receipt = receipts[id]
  if (!receipt) throw new Error(`No expense ${id}`)
  if (name === 'verify_receipt') {
    if (!receipt.readable) throw new Error(`Receipt for ${id} is unreadable`)
    return `Receipt for ${id} verified: $${receipt.amount}`
  }
  if (name === 'approve_expense') return `Expense ${id} approved`
  throw new Error(`Unknown tool ${name}`)
}

const result = await runAgent({
  prompt: 'Approve expenses E1 and E2 if their receipts check out. Report what happened to each.',
  executeTool: requirePrerequisite(run, { tool: 'approve_expense', requires: 'verify_receipt', key: 'expense_id' }),
  send: (messages) =>
    client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      // If Claude declines a request, the API retries it on a fallback model chosen by refusal category.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      tools,
      messages,
    }),
})

console.log(`status: ${result.status} after ${result.turns} turn(s)\n`)
console.log(result.text)
