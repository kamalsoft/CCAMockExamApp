// Lab: build an MCP-style tool that reports errors an agent can act on, and a retry wrapper.
// Run `npm run check` until every test passes.

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

/**
 * Part 1: the search_customers tool.
 *
 * Every result has exactly one text content block.
 * - Success: isError false, text is JSON {"customers": [...]}. No matches is still a success,
 *   with an empty array. An empty result must never stand in for a failure.
 * - Failure: isError true, text is JSON {"errorCategory", "isRetryable", "message"}:
 *   - query missing, not a string, or under 2 characters after trimming:
 *     "validation", not retryable. Don't call the backend.
 *   - BackendError 401 or 403: "permission", not retryable.
 *   - BackendError 408, 429, or 500 and above, or any non-BackendError (a network failure):
 *     "transient", retryable.
 *   - Any other BackendError status: "validation", not retryable.
 */
export async function searchCustomers(backend: Backend, input: { query?: unknown }): Promise<ToolResult> {
  throw new Error('TODO: implement searchCustomers')
}

/**
 * Part 2: local recovery for transient failures.
 *
 * Call `call()`. Return as soon as it succeeds, or fails with an error that is not retryable.
 * Retry only errors whose isRetryable is true, up to `maxAttempts` calls in total.
 * Return the last result and how many times `call()` ran.
 */
export async function callWithRetry(
  call: () => Promise<ToolResult>,
  maxAttempts = 3,
): Promise<{ result: ToolResult; attempts: number }> {
  throw new Error('TODO: implement callWithRetry')
}
