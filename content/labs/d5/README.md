# Lab: Provenance and calibrated review

## Step 1: Build provenance-preserving synthesis

Implement `synthesize(findings, failedSources)`:

- Group findings by `claim`
- Make one entry per distinct (value, date) pair
- List all sources for each pair, sorted by date
- Set claim status:
  - `"established"`: one value from 2+ findings (different dates)
  - `"single-source"`: one value from one finding
  - `"trend"`: different values from different years (change over time)
  - `"contested"`: different values where any date repeats (keep all)
- Return `gaps` for failed sources
- Never average or drop values

- [ ] Step 1 complete

## Step 2: Implement calibrated review routing

Build `routeForReview(extraction, thresholds)`:

- Route to `"human"` when:
  - Source is contradictory (`conflict_detected: true`)
  - Any field's confidence < its calibrated threshold
  - Field has no calibrated threshold
- Otherwise route to `"auto"`
- Return one reason per problem field

- [ ] Step 2 complete

## Step 3: Create stratified sampler

Implement `stratifiedSample(items, perStratum, random)`:

- Pick up to `perStratum` random IDs from each stratum
- Use `random()` for every choice (tests provide deterministic `Math.random`)
- Include full stratum if it has fewer than `perStratum` items
- Never pick same ID twice

- [ ] Step 3 complete

## Check your work

```sh
cd labs/d5-provenance-review
npm run check
```

## Expected output (complete)

```text
▶ Part 1: synthesize
  ✔ groups findings by claim
  ✔ sets status based on value/date distribution
  ...
▶ Part 2: routeForReview
  ✔ routes contradictory evidence to human
  ✔ routes low confidence fields to human
  ...
▶ Part 3: stratifiedSample
  ✔ samples from each stratum
  ✔ never duplicates IDs
ℹ tests 10
ℹ pass 10
ℹ fail 0
```