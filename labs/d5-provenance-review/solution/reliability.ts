// Reference solution. Try the lab in src/reliability.ts before reading this.

export type Finding = { claim: string; value: string; source: string; date: string }
export type ClaimStatus = 'established' | 'single-source' | 'contested' | 'trend'
export type Claim = { claim: string; status: ClaimStatus; values: { value: string; date: string; sources: string[] }[] }

export function synthesize(findings: Finding[], failedSources: string[]): { claims: Claim[]; gaps: string[] } {
  const byClaim = new Map<string, Finding[]>()
  for (const f of findings) byClaim.set(f.claim, [...(byClaim.get(f.claim) ?? []), f])

  const claims = [...byClaim].map(([claim, group]): Claim => {
    // One entry per distinct (value, date), keeping every source that reported it.
    const values: Claim['values'] = []
    for (const f of group) {
      const same = values.find((v) => v.value === f.value && v.date === f.date)
      if (same) same.sources.push(f.source)
      else values.push({ value: f.value, date: f.date, sources: [f.source] })
    }
    values.sort((a, b) => a.date.localeCompare(b.date))

    const distinctValues = new Set(values.map((v) => v.value)).size
    const dates = values.map((v) => v.date)
    let status: ClaimStatus
    if (distinctValues === 1) status = group.length > 1 ? 'established' : 'single-source'
    // Different values from different dates are a change over time, not a contradiction.
    else if (new Set(dates).size === dates.length) status = 'trend'
    else status = 'contested'
    return { claim, status, values }
  })
  return { claims, gaps: failedSources }
}

export type Extraction = { fields: Record<string, { value: unknown; confidence: number }>; conflict_detected?: boolean }

export function routeForReview(extraction: Extraction, thresholds: Record<string, number>): { route: 'auto' | 'human'; reasons: string[] } {
  const reasons: string[] = []
  if (extraction.conflict_detected) reasons.push('source document is contradictory')
  for (const [field, { confidence }] of Object.entries(extraction.fields)) {
    const threshold = thresholds[field]
    if (threshold === undefined) reasons.push(`${field}: no calibrated threshold`)
    else if (confidence < threshold) reasons.push(`${field}: confidence ${confidence} below ${threshold}`)
  }
  return { route: reasons.length ? 'human' : 'auto', reasons }
}

export function stratifiedSample(items: { id: string; stratum: string }[], perStratum: number, random = Math.random): string[] {
  const strata = new Map<string, string[]>()
  for (const item of items) strata.set(item.stratum, [...(strata.get(item.stratum) ?? []), item.id])
  return [...strata.values()].flatMap((ids) => {
    const pool = [...ids]
    const picked: string[] = []
    while (picked.length < perStratum && pool.length) picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0])
    return picked
  })
}
