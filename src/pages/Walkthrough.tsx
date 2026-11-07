import { useEffect } from 'react'
import type { WalkthroughPage } from '../lib/content-index.ts'
import type { Domain } from '../lib/schema.ts'

export function Walkthrough({ walkthroughs, domains, domainId, anchor, onSeen }: {
  walkthroughs: WalkthroughPage[]
  domains: Domain[]
  domainId?: string
  anchor?: string
  onSeen: (domainId: string) => void
}) {
  const page = walkthroughs.find((w) => w.domainId === domainId)

  useEffect(() => {
    if (anchor) document.getElementById(anchor)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [anchor, domainId])

  useEffect(() => {
    if (page) onSeen(page.domainId)
  }, [page, onSeen])

  if (!page) return <DocIndex kind="walkthrough" label="Walkthroughs" pages={walkthroughs} domains={domains} />
  return (
    <article>
      <h2 className="text-xl font-semibold">{page.title}</h2>
      {/* HTML rendered at build time from the repository's own Markdown (scripts/build-index.ts). */}
      <div className="doc" dangerouslySetInnerHTML={{ __html: page.introHtml }} />
      {page.sections.map((s) => (
        <section key={s.anchor} id={s.anchor} aria-labelledby={`${s.anchor}-h`} className="mt-8 scroll-mt-4">
          <h3 id={`${s.anchor}-h`} className="text-lg font-semibold">{s.title}</h3>
          <div className="doc" dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}
    </article>
  )
}

// Lists the domains that have a page of this kind, or says none exist yet.
export function DocIndex({ kind, label, pages, domains }: {
  kind: 'walkthrough' | 'lab'
  label: string
  pages: { domainId: string }[]
  domains: Domain[]
}) {
  return (
    <section aria-labelledby={`${kind}-index`}>
      <h2 id={`${kind}-index`} className="text-xl font-semibold">{label}</h2>
      <ul className="mt-4 space-y-2">
        {domains.map((d) => {
          const available = pages.some((p) => p.domainId === d.id)
          return (
            <li key={d.id}>
              {available ? (
                <a className="text-blue-700 underline" href={`#${kind}-${d.id}`}>{d.name}</a>
              ) : (
                <span className="text-gray-500">{d.name} (coming soon)</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
