# Lab: An extraction-quality loop

## Step 1: Validate an extracted invoice

Implement `validateInvoice` to check extracted invoice data:

- Input is any JSON value
- Return array of errors (empty = valid)
- Expected shape: `{ invoice_number, issue_date: "YYYY-MM-DD" | null, tax_id: string | null, total: number, line_items: [...] }`

**Error types:**
- Not an object: `{ field: "*", retryable: true }`
- Wrong/missing field: `{ field: "fieldName", retryable: true }`
- Line items don't match total: `{ field: "total", retryable: false }` (source document error)

- [ ] Step 1 complete

## Step 2: Implement extraction with retry feedback

Build `extractWithRetry` that:

1. Sends document to model
2. Parses JSON response
3. Validates with step 1
4. If non-retryable errors or max attempts: return `{ invoice, errors, attempts }`
5. If retryable errors: send error list back, try again

- [ ] Step 2 complete

## Step 3: Handle batch results pairing

Implement `pairBatchResults`:

- Match results by `custom_id`, NOT by position
- Results can arrive out of order
- Return `{ succeeded: [...], resubmit: [...] }` ordered by input `requestIds`

- [ ] Step 3 complete

## Check your work

```sh
cd labs/d4-extraction-loop
npm run check
```

## Expected output (complete)

```text
▶ Part 1: validateInvoice
  ✔ rejects non-object input
  ✔ reports missing required fields
  ...
▶ Part 2: extractWithRetry
  ✔ parses and validates JSON
  ✔ retries on retryable errors
  ...
▶ Part 3: pairBatchResults
  ✔ matches by custom_id
  ✔ returns ordered lists
ℹ tests 12
ℹ pass 12
ℹ fail 0
```