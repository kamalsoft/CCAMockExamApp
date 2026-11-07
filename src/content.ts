import raw from 'virtual:content'
import type { ContentIndex } from './lib/content-index.ts'

// Built and validated by scripts/build-index.ts, so its shape is known here.
export const content = raw as ContentIndex

// The walkthrough section that explains a concept, if the domain has a walkthrough.
export function conceptAnchor(domainId: string, concept: string) {
  const page = content.walkthroughs.find((w) => w.domainId === domainId)
  return page?.sections.find((s) => s.concepts.includes(concept))?.anchor
}
