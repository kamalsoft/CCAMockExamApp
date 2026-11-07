// Reference solution. Try the lab in src/tools.ts before reading this.

/** The shape of an MCP tools/call result (MCP spec 2025-06-18), text content only. */
export type ToolResult = { content: { type: 'text'; text: string }[]; isError: boolean }
export type ErrorCategory = 'transient' | 'validation' | 'permission' | 'business'
export type ToolError = { errorCategory: ErrorCategory; isRetryable: boolean; message: string }

export type Customer = { id: string; name: string; email: string }
export type Backend = { search(query: string): Promise<Customer[]> }

/** Thrown by the backend for HTTP failures. Anything else it throws is a network failure. */
export class BackendError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const success = (data: unknown): ToolResult => ({ content: [{ type: 'text', text: JSON.stringify(data) }], isError: false })
const failure = (error: ToolError): ToolResult => ({ content: [{ type: 'text', text: JSON.stringify(error) }], isError: true })

export async function searchCustomers(backend: Backend, input: { query?: unknown }): Promise<ToolResult> {
  const query = typeof input?.query === 'string' ? input.query.trim() : ''
  if (query.length < 2) {
    return failure({ errorCategory: 'validation', isRetryable: false, message: 'query must be at least 2 characters' })
  }
  try {
    return success({ customers: await backend.search(query) })
  } catch (error) {
    const status = error instanceof BackendError ? error.status : undefined
    if (status === 401 || status === 403) {
      return failure({ errorCategory: 'permission', isRetryable: false, message: 'Not allowed to search customers' })
    }
    if (status === undefined || status === 408 || status === 429 || status >= 500) {
      return failure({ errorCategory: 'transient', isRetryable: true, message: 'Customer search is temporarily unavailable' })
    }
    return failure({ errorCategory: 'validation', isRetryable: false, message: `Customer search rejected the request (${status})` })
  }
}

export async function callWithRetry(
  call: () => Promise<ToolResult>,
  maxAttempts = 3,
): Promise<{ result: ToolResult; attempts: number }> {
  let attempts = 0
  while (true) {
    attempts++
    const result = await call()
    if (!result.isError || attempts >= maxAttempts) return { result, attempts }
    const error = JSON.parse(result.content[0].text) as ToolError
    if (!error.isRetryable) return { result, attempts }
  }
}
