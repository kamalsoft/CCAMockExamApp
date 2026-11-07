// Lab: provenance-preserving synthesis and calibrated human review. Run `npm run check` until every test passes.

/** One finding from a research subagent. `date` is a year, such as "2025". */
export type Finding = { claim: string; value: string; source: string; date: string }
export type ClaimStatus = 'established' | 'single-source' | 'contested' | 'trend'
export type Claim = { claim: string; status: ClaimStatus; values: { value: string; date: string; sources: string[] }[] }

/**
 * Part 1: merge findings without losing where each one came from.
 *
 * Group findings by `claim`. Within a claim, make one entry per distinct (value, date) pair,
 * listing every source that reported it, sorted by date. Then set the status:
 * - one distinct value from two or more findings: "established"
 * - one distinct value from a single finding: "single-source"
 * - different values, each from a different date: "trend" (change over time, not a contradiction)
 * - different values where any date repeats: "contested" (keep every value and source)
 * Never average or drop a value. Return `gaps` as the failed sources, so the report can say what's missing.
 */
export function synthesize(findings: Finding[], failedSources: string[]): { claims: Claim[]; gaps: string[] } {
  throw new Error('TODO: implement synthesize')
}

export type Extraction = { fields: Record<string, { value: unknown; confidence: number }>; conflict_detected?: boolean }

/**
 * Part 2: route an extraction to a person or let it through.
 *
 * `thresholds` holds a calibrated confidence threshold per field. Send to "human" when the source
 * is contradictory (conflict_detected), when any field's confidence is below its own threshold, or
 * when a field has no calibrated threshold. Otherwise "auto". Return one readable reason per problem.
 */
export function routeForReview(extraction: Extraction, thresholds: Record<string, number>): { route: 'auto' | 'human'; reasons: string[] } {
  throw new Error('TODO: implement routeForReview')
}

/**
 * Part 3: a stratified random sample for ongoing review of automated items.
 *
 * Pick up to `perStratum` ids at random from each stratum (use `random()` for every choice, so tests
 * can make it repeatable). Include a stratum's items in full when it has fewer than `perStratum`.
 * Never pick an id twice.
 */
export function stratifiedSample(items: { id: string; stratum: string }[], perStratum: number, random = Math.random): string[] {
  throw new Error('TODO: implement stratifiedSample')
}
