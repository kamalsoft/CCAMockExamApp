// Reference solution. Try the lab in src/extraction.ts before reading this.

export type ValidationError = { field: string; message: string; retryable: boolean }
export type Message = { role: 'user' | 'assistant'; content: string }
/** Sends the conversation to the model and returns its text reply. */
export type Send = (messages: Message[]) => Promise<string>

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

export function validateInvoice(x: unknown): ValidationError[] {
  if (!isObject(x)) return [{ field: '*', message: 'must be a JSON object', retryable: true }]
  const errors: ValidationError[] = []
  const add = (field: string, message: string, retryable = true) => errors.push({ field, message, retryable })

  if (typeof x.invoice_number !== 'string' || !x.invoice_number) add('invoice_number', 'must be a non-empty string')
  if (x.issue_date !== null && (typeof x.issue_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x.issue_date))) {
    add('issue_date', 'must be an ISO 8601 date (YYYY-MM-DD), or null when the document has none')
  }
  if (x.tax_id !== null && typeof x.tax_id !== 'string') add('tax_id', 'must be a string, or null when the document has none')
  if (typeof x.total !== 'number') add('total', 'must be a number')

  const items = x.line_items
  if (!Array.isArray(items) || !items.every((i) => isObject(i) && typeof i.description === 'string' && typeof i.amount === 'number')) {
    add('line_items', 'must be an array of { description: string, amount: number }')
  } else if (typeof x.total === 'number') {
    const sum = items.reduce((total: number, i) => total + (i.amount as number), 0)
    // A mismatch can be the source document's own error, so it is flagged for review, not retried.
    if (Math.abs(sum - x.total) > 0.01) add('total', `line items sum to ${sum.toFixed(2)} but total is ${x.total.toFixed(2)}`, false)
  }
  return errors
}

export async function extractWithRetry({ send, document, maxAttempts = 3 }: {
  send: Send
  document: string
  maxAttempts?: number
}): Promise<{ invoice: unknown; errors: ValidationError[]; attempts: number }> {
  const messages: Message[] = [
    { role: 'user', content: `Extract the invoice as JSON.\n<document>\n${document}\n</document>` },
  ]
  for (let attempts = 1; ; attempts++) {
    const reply = await send(messages)
    let invoice: unknown = null
    let errors: ValidationError[]
    try {
      invoice = JSON.parse(reply)
      errors = validateInvoice(invoice)
    } catch {
      errors = [{ field: '*', message: 'reply is not valid JSON', retryable: true }]
    }

    const fixable = errors.filter((e) => e.retryable)
    if (fixable.length === 0 || attempts >= maxAttempts) return { invoice, errors, attempts }

    messages.push({ role: 'assistant', content: reply })
    messages.push({
      role: 'user',
      content: `The extraction failed validation. Fix these fields and reply with the corrected JSON only:\n${fixable
        .map((e) => `- ${e.field}: ${e.message}`)
        .join('\n')}`,
    })
  }
}

export type BatchResult = { custom_id: string; result: { type: 'succeeded' | 'errored' | 'canceled' | 'expired' } }

export function pairBatchResults(requestIds: string[], results: BatchResult[]) {
  const byId = new Map(results.map((r) => [r.custom_id, r]))
  const succeeded = requestIds.filter((id) => byId.get(id)?.result.type === 'succeeded')
  const resubmit = requestIds.filter((id) => byId.get(id)?.result.type !== 'succeeded')
  return { succeeded, resubmit }
}
