# Lab: An extraction-quality loop

## Goal

Build the code around a structured extraction that makes it trustworthy:

1. **Validation** that separates fixable problems (a malformed date, a missing field, a reply that isn't JSON) from problems a retry can't fix (line items that don't add up, which may be the source document's own error).
2. **Retry with feedback**: on a fixable failure, send back the conversation with the document, the failed extraction, and the specific errors. Stop when only unfixable problems remain or the attempt limit is reached.
3. **Batch result handling**: pair Message Batches results with requests by `custom_id`, because results can arrive in any order, and list the requests to resubmit.

This lab covers task statements 4.4 and 4.5 in the [Domain 4 walkthrough](#walkthrough-d4).

## Prerequisites

- Node.js 22.18 or later.
- The repository cloned locally. The checker uses a scripted fake model, so it needs no API key and costs nothing.

## Starter files

All files are in `labs/d4-extraction-loop/`:

| File | Purpose |
| --- | --- |
| `src/extraction.ts` | **Your work.** `validateInvoice`, `extractWithRetry`, and `pairBatchResults`, with the rules in the comments. |
| `tests/extraction.test.ts` | The checker. A fake model replies from a script and records every conversation it receives. |
| `solution/extraction.ts` | A reference solution. Try the lab first. |

## Check your work

```sh
cd labs/d4-extraction-loop
npm run check
```

No install is needed. Run `npm install` for editor type hints.

## Expected output

On the untouched starter, all 10 tests fail and the command exits with code 1:

```text
ℹ tests 10
ℹ pass 0
ℹ fail 10
```

When your implementation is complete, every test passes and the command exits with code 0:

```text
▶ Part 1: validateInvoice
  ✔ flags line items that do not add up, without marking it retryable
  ...
▶ Part 2: extractWithRetry
  ✔ retries with the failed reply and the specific errors, then succeeds
  ✔ does not retry when only non-retryable errors remain
  ...
▶ Part 3: pairBatchResults
  ✔ matches results by custom_id, not by position, and lists what to resubmit
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

## Going further

In production you'd also use structured outputs (`output_config.format` with a JSON schema), so the reply is always valid JSON. Your validation stays, because structured outputs guarantee shape, not that the numbers add up.
