export type Route =
  | { page: 'drill' | 'exam' }
  | { page: 'walkthrough' | 'lab'; domainId?: string; anchor?: string }

// Hash routes: #drill, #exam, #walkthrough-d1, #wt-d1-<section>, #lab-d1. Anything else is the drill.
export function parseRoute(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (h === 'exam') return { page: 'exam' }
  if (h === 'walkthrough' || h === 'lab') return { page: h }
  let m = h.match(/^(walkthrough|lab)-(d\d+)$/)
  if (m) return { page: m[1] as 'walkthrough' | 'lab', domainId: m[2] }
  m = h.match(/^wt-(d\d+)-.+$/)
  if (m) return { page: 'walkthrough', domainId: m[1], anchor: h }
  return { page: 'drill' }
}
