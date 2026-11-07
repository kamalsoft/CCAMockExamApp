import type { LabPage } from '../lib/content-index.ts'
import type { Domain } from '../lib/schema.ts'
import { DocIndex } from './Walkthrough.tsx'

// Shows the lab README and the commands to run. Learner code runs locally, never in the browser,
// so completion is self-reported.
export function Lab({ labs, domains, domainId, completed, onCompletedChange }: {
  labs: LabPage[]
  domains: Domain[]
  domainId?: string
  completed: Record<string, boolean>
  onCompletedChange: (domainId: string, done: boolean) => void
}) {
  const lab = labs.find((l) => l.domainId === domainId)
  if (!lab) return <DocIndex kind="lab" label="Labs" pages={labs} domains={domains} />
  return (
    <article>
      {/* HTML rendered at build time from the repository's own Markdown (scripts/build-index.ts). */}
      <div className="doc" dangerouslySetInnerHTML={{ __html: lab.html }} />
      <label className="mt-8 flex items-start gap-2 rounded border border-gray-300 bg-gray-50 p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={!!completed[lab.domainId]}
          onChange={(e) => onCompletedChange(lab.domainId, e.target.checked)}
        />
        <span>
          I ran <code>npm run check</code> in <code>labs/{lab.labId}</code> and every test passed.
        </span>
      </label>
    </article>
  )
}
