# Lab: Provenance and calibrated review

## Goal

Build the pieces that keep a multi-source system honest about what it knows:

1. **Provenance-preserving synthesis:** merge research findings by claim, keeping every source.
   - Sources that agree: **established**.
   - A single source: **single-source**.
   - Different values from the same period: **contested**. Keep every value; never average.
   - Different values from different years: a **trend**, not a contradiction.
   - Failed sources: reported as coverage gaps.
2. **Calibrated review routing:** send an extraction to a person when the source is contradictory, when any field is below its *own* calibrated threshold, or when a field has no calibrated threshold.
3. **Stratified sampling:** draw a random sample from every document type, including small ones, to keep measuring automated accuracy.

This lab covers task statements 5.3, 5.5, and 5.6 in the [Domain 5 walkthrough](#walkthrough-d5).

## Prerequisites

- Node.js 22.18 or later.
- The repository cloned locally. The checker needs no API key and costs nothing.

## Starter files

All files are in `labs/d5-provenance-review/`:

| File | Purpose |
| --- | --- |
| `src/reliability.ts` | **Your work.** `synthesize`, `routeForReview`, and `stratifiedSample`, with the rules in the comments. |
| `tests/reliability.test.ts` | The checker, with sample findings, extractions, and a repeatable random generator. |
| `solution/reliability.ts` | A reference solution. Try the lab first. |

## Check your work

```sh
cd labs/d5-provenance-review
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
▶ Part 1: synthesize
  ✔ conflicting values from the same period are contested, with both values and sources kept
  ✔ different values from different years are a trend, sorted by date
  ...
▶ Part 2: routeForReview
  ✔ uses each field's calibrated threshold, not a single global one
  ...
▶ Part 3: stratifiedSample
  ✔ samples every stratum, including small ones, up to the limit
  ...
ℹ tests 10
ℹ pass 10
ℹ fail 0
```
