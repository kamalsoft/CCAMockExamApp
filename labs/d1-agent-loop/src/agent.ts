// Lab: build an agent loop and a prerequisite gate. Run `npm run check` until every test passes.
import type Anthropic from '@anthropic-ai/sdk'

type Message = Anthropic.Beta.BetaMessage
type MessageParam = Anthropic.Beta.BetaMessageParam

/** Sends the whole conversation to Claude and returns its response. */
export type Send = (messages: MessageParam[]) => Promise<Message>
/** Runs one tool and returns its result as text. Throws if the tool fails. */
export type ExecuteTool = (name: string, input: unknown) => Promise<string>
export type AgentResult = {
  status: 'done' | 'truncated' | 'refusal' | 'turn_limit'
  /** The text blocks of the last response, joined with newlines. Empty for turn_limit. */
  text: string
  /** The full conversation, including the final assistant turn. */
  messages: MessageParam[]
  /** How many times send() was called. */
  turns: number
}

/**
 * Part 1: the loop.
 *
 * 1. Start the conversation with one user message holding `prompt`.
 * 2. Call send(), then append the response's whole `content` as an assistant message.
 * 3. Branch on `stop_reason`:
 *    - "tool_use": run every tool_use block with executeTool and append ONE user message
 *      containing a tool_result block per call (matching tool_use_id) and nothing else.
 *      If a tool throws, return its error message with `is_error: true` and keep going.
 *    - "pause_turn": send again without adding anything.
 *    - "end_turn" or "stop_sequence": return status "done".
 *    - "max_tokens" or "model_context_window_exceeded": return "truncated". Do not run its tools.
 *    - "refusal": return "refusal".
 * 4. After `maxTurns` calls to send() without finishing, return "turn_limit".
 */
export async function runAgent({ send, executeTool, prompt, maxTurns = 20 }: {
  send: Send
  executeTool: ExecuteTool
  prompt: string
  maxTurns?: number
}): Promise<AgentResult> {
  throw new Error('TODO: implement runAgent')
}

/**
 * Part 2: a prerequisite gate.
 *
 * Return a new ExecuteTool that blocks `rule.tool` until `rule.requires` has succeeded
 * (returned without throwing) for the same value of `input[rule.key]`.
 * A blocked call must throw an Error whose message starts with "Blocked:", so the loop
 * reports it to Claude as an error result. Every other call passes through unchanged.
 *
 * Example: requirePrerequisite(run, { tool: 'approve_expense', requires: 'verify_receipt', key: 'expense_id' })
 */
export function requirePrerequisite(
  executeTool: ExecuteTool,
  rule: { tool: string; requires: string; key: string },
): ExecuteTool {
  throw new Error('TODO: implement requirePrerequisite')
}
