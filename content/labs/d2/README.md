# Lab: Tool errors an agent can act on

## Step 1: Implement the search_customers tool

Build an MCP-style tool that returns structured results:

**Success case:**
- `isError: false`, `content` is JSON `{"customers": [...]}`
- No matches = empty array (still a success)

**Failure cases:**
- Validation error (missing/short query): `errorCategory: "validation"`, `isRetryable: false`
- Permission error (401/403): `errorCategory: "permission"`, `isRetryable: false`
- Transient error (408, 429, 500+, network): `errorCategory: "transient"`, `isRetryable: true`
- Other errors: `errorCategory: "validation"`, `isRetryable: false`

**Expected test output after Step 1:**
```text
▶ Part 1: searchCustomers
  ✖ handles missing query
  ✖ returns empty array on no match
  ...
```

- [ ] Step 1 complete

## Step 2: Implement retry wrapper

Build `callWithRetry` that provides local recovery:

1. Call the function
2. Return immediately on success OR on non-retryable error
3. Retry only if `result.isRetryable === true`
4. Stop after `maxAttempts` total calls
5. Return the final result and attempt count

**Expected test output after Step 2 (all tests pass):**
```text
▶ Part 1: searchCustomers
  ✔ handles missing query validation
  ✔ returns empty array when backend has no match
  ...
▶ Part 2: callWithRetry
  ✔ returns immediately on success
  ✔ retries transient errors up to max attempts
  ...
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

- [ ] Step 2 complete

## Prerequisites

- Node.js 22.18 or later. Run locally.
- No API key needed; the checker uses a fake backend.

## Check your work

```sh
cd labs/d2-tool-errors
npm run check
```

## Expected output (complete)

```text
▶ Part 1: searchCustomers
  ✔ handles missing query validation
  ✔ returns empty array when backend has no match
  ...
▶ Part 2: callWithRetry
  ✔ returns immediately on success
  ✔ retries on transient errors
  ...
ℹ tests 10
ℹ pass 10
ℹ fail 0
```