export type Route =
  | { page: 'home' }
  | { page: 'drill' | 'exam' | 'progress' | 'settings' }
  | { page: 'walkthrough' | 'lab'; domainId?: string; anchor?: string }

// Hash routes: #home, #drill, #exam, #progress, #settings, #walkthrough-d1, #wt-d1-<section>, #lab-d1. Empty hash is home.
export function parseRoute(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (h === '' || h === 'home') return { page: 'home' }
  if (h === 'exam' || h === 'progress' || h === 'settings') return { page: h }
  if (h === 'walkthrough' || h === 'lab') return { page: h }
  let m = h.match(/^(walkthrough|lab)-(d\d+)$/)
  if (m) return { page: m[1] as 'walkthrough' | 'lab', domainId: m[2] }
  m = h.match(/^wt-(d\d+)-.+$/)
  if (m) return { page: 'walkthrough', domainId: m[1], anchor: h }
  return { page: 'drill' }
}
