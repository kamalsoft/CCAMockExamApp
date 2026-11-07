# Lab: Tool errors an agent can act on

## Goal

Build the error handling that separates a reliable tool from a confusing one:

1. **An MCP-style `search_customers` tool** that returns results in the MCP `tools/call` shape. No match is an empty success. Every failure sets `isError: true` and carries a structured error: `errorCategory` (transient, validation, permission), `isRetryable`, and a readable `message`. An outage must never look like "no customers found".
2. **A retry wrapper** for local recovery: retry only errors marked retryable, up to a bounded number of attempts, and return immediately on success or on a non-retryable error.

This lab covers task statements 2.2 and 2.3 in the [Domain 2 walkthrough](#walkthrough-d2).

## Prerequisites

- Node.js 22.18 or later. The lab runs TypeScript directly, with no build step.
- The repository cloned locally. The lab needs no API key and makes no network calls.

## Starter files

All files are in `labs/d2-tool-errors/`:

| File | Purpose |
| --- | --- |
| `src/tools.ts` | **Your work.** `searchCustomers` and `callWithRetry`, with the rules in the comments. |
| `tests/tools.test.ts` | The checker. It uses a fake customer backend that can succeed, return nothing, or fail with HTTP or network errors. |
| `solution/tools.ts` | A reference solution. Try the lab first. |

## Check your work

```sh
cd labs/d2-tool-errors
npm run check
```

No install is needed. Run `npm install` if you want editor type hints.

## Expected output

On the untouched starter, all 10 tests fail and the command exits with code 1:

```text
ℹ tests 10
ℹ pass 0
ℹ fail 10
```

When your implementation is complete, every test passes and the command exits with code 0:

```text
▶ Part 1: searchCustomers
  ✔ returns matches as JSON with isError false
  ✔ no match is an empty success, not an error
  ...
▶ Part 2: callWithRetry
  ✔ retries transient errors until one succeeds
  ✔ never retries an error that is not retryable
  ...
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

## Going further

Write the MCP `description` for `search_customers` as you would for production. Say what it searches, what it returns, the minimum query length, what an empty result means, and which tool to use instead for account login data.
