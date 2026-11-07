// Reference solution. Try the lab in src/agent.ts before reading this.
import type Anthropic from '@anthropic-ai/sdk'

type Message = Anthropic.Beta.BetaMessage
type MessageParam = Anthropic.Beta.BetaMessageParam
type ToolResult = Anthropic.Beta.BetaToolResultBlockParam

export type Send = (messages: MessageParam[]) => Promise<Message>
export type ExecuteTool = (name: string, input: unknown) => Promise<string>
export type AgentResult = {
  status: 'done' | 'truncated' | 'refusal' | 'turn_limit'
  text: string
  messages: MessageParam[]
  turns: number
}

export async function runAgent({ send, executeTool, prompt, maxTurns = 20 }: {
  send: Send
  executeTool: ExecuteTool
  prompt: string
  maxTurns?: number
}): Promise<AgentResult> {
  const messages: MessageParam[] = [{ role: 'user', content: prompt }]

  for (let turns = 1; turns <= maxTurns; turns++) {
    const response = await send(messages)
    messages.push({ role: 'assistant', content: response.content })
    const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n')

    switch (response.stop_reason) {
      case 'tool_use': {
        const results: ToolResult[] = []
        for (const block of response.content) {
          if (block.type !== 'tool_use') continue
          try {
            results.push({ type: 'tool_result', tool_use_id: block.id, content: await executeTool(block.name, block.input) })
          } catch (error) {
            const content = error instanceof Error ? error.message : String(error)
            results.push({ type: 'tool_result', tool_use_id: block.id, content, is_error: true })
          }
        }
        messages.push({ role: 'user', content: results })
        break
      }
      case 'pause_turn':
        // The assistant turn is already appended; sending again lets Claude continue.
        break
      case 'end_turn':
      case 'stop_sequence':
        return { status: 'done', text, messages, turns }
      case 'max_tokens':
      case 'model_context_window_exceeded':
        return { status: 'truncated', text, messages, turns }
      case 'refusal':
        return { status: 'refusal', text, messages, turns }
      default:
        throw new Error(`Unhandled stop_reason: ${response.stop_reason}`)
    }
  }
  return { status: 'turn_limit', text: '', messages, turns: maxTurns }
}

export function requirePrerequisite(
  executeTool: ExecuteTool,
  rule: { tool: string; requires: string; key: string },
): ExecuteTool {
  const passed = new Set<unknown>()
  return async (name, input) => {
    const id = (input as Record<string, unknown> | null)?.[rule.key]
    if (name === rule.tool && !passed.has(id)) {
      throw new Error(`Blocked: ${rule.requires} must succeed for ${rule.key} ${String(id)} before ${rule.tool}.`)
    }
    const result = await executeTool(name, input)
    if (name === rule.requires) passed.add(id)
    return result
  }
}
