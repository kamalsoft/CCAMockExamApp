import type { LabPage } from '../lib/content-index.ts'
import type { Domain } from '../lib/schema.ts'
import { DocIndex } from './Walkthrough.tsx'

// Shows the lab README and the commands to run. Learner code runs locally, never in the browser.
export function Lab({ labs, domains, domainId }: { labs: LabPage[]; domains: Domain[]; domainId?: string }) {
  const lab = labs.find((l) => l.domainId === domainId)
  if (!lab) return <DocIndex kind="lab" label="Labs" pages={labs} domains={domains} />
  return (
    <article>
      {/* HTML rendered at build time from the repository's own Markdown (scripts/build-index.ts). */}
      <div className="doc" dangerouslySetInnerHTML={{ __html: lab.html }} />
    </article>
  )
}
