export type WalkthroughSection = { slug: string; title: string; concepts: string[]; body: string }
export type ParsedWalkthrough = { title: string; intro: string; sections: WalkthroughSection[] }

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Splits a walkthrough on `## ` headings. A `<!-- concepts: a, b -->` line under a heading
// lists the question concepts that section explains.
export function parseWalkthrough(markdown: string): ParsedWalkthrough {
  const [head, ...chunks] = markdown.split(/^## /m)
  const title = head.match(/^# (.+)$/m)?.[1].trim() ?? ''
  const intro = head.replace(/^# .+$/m, '').trim()
  const sections = chunks.map((chunk) => {
    const [heading, ...rest] = chunk.split('\n')
    const body = rest.join('\n')
    const concepts = body.match(/<!--\s*concepts:(.*?)-->/)?.[1].split(',').map((c) => c.trim()).filter(Boolean) ?? []
    return { slug: slugify(heading), title: heading.trim(), concepts, body: body.trim() }
  })
  return { title, intro, sections }
}

// The id a section gets on the page, also used as the link target from question concepts.
export const sectionAnchor = (domainId: string, slug: string) => `wt-${domainId}-${slug}`
