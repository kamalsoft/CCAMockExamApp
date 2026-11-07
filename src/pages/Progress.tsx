import { useState } from 'react'
import { button } from '../components/QuestionCard.tsx'
import { conceptAnchor } from '../content.ts'
import { conceptAccuracy, type Progress as ProgressData } from '../lib/progress.ts'
import { DOMAIN_TARGET, examScore, PASS_MARK, readiness } from '../lib/readiness.ts'
import type { Domain, Question } from '../lib/schema.ts'

const pct = (n: number) => `${Math.round(n * 100)}%`

export function Progress({ progress, domains, questions, onReset }: {
  progress: ProgressData
  domains: Domain[]
  questions: Question[]
  onReset: () => void
}) {
  const { ready, conditions } = readiness(progress, domains)
  const exams = progress.attempts.filter((a) => a.mode === 'exam')
  const drills = progress.attempts.filter((a) => a.mode === 'drill')
  const weakest = conceptAccuracy(progress.attempts, questions, 2).slice(0, 5)

  return (
    <div className="space-y-8">
      <section aria-labelledby="readiness-heading">
        <h2 id="readiness-heading" className="text-xl font-semibold">Readiness</h2>
        <p className={`mt-2 text-lg font-medium ${ready ? 'text-green-700' : 'text-gray-900'}`}>
          {ready ? 'Likely ready for the exam' : 'Not ready yet'}
        </p>
        <p className="text-sm text-gray-600">
          An estimate, not a guarantee. The real exam reports a scaled score (720 of 100–1,000 passes); this app
          uses practice targets of {pct(PASS_MARK)} overall and {pct(DOMAIN_TARGET)} per domain.
        </p>
        <ul className="mt-4 space-y-2">
          {conditions.map((c) => (
            <li key={c.id} className="flex gap-2">
              <span aria-hidden="true" className={c.met ? 'text-green-700' : 'text-red-700'}>{c.met ? '✓' : '✗'}</span>
              <span>
                <span className="font-medium">{c.label}</span>
                <span className="sr-only">{c.met ? ' (met)' : ' (not met)'}</span>
                <span className="block text-sm text-gray-600">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="exams-heading">
        <h2 id="exams-heading" className="text-xl font-semibold">Mock exams</h2>
        {exams.length === 0 ? (
          <p className="mt-2 text-gray-600">No mock exams yet. Finished exams appear here.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 pr-3">Date</th>
                  <th className="py-1 pr-3">Score</th>
                  {domains.map((d) => (
                    <th key={d.id} className="py-1 pr-3" title={d.name}>{d.id.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-1 pr-3">
                      {new Date(a.finished_at).toLocaleDateString()}
                      {!a.full && <span className="block text-xs text-gray-500">short exam</span>}
                    </td>
                    <td className="py-1 pr-3">{pct(examScore(a))}</td>
                    {domains.map((d) => {
                      const s = a.score_by_domain[d.id]
                      return <td key={d.id} className="py-1 pr-3">{s?.total ? pct(s.correct / s.total) : '–'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-600">
          {drills.length} {drills.length === 1 ? 'drill' : 'drills'} completed.
        </p>
      </section>

      <section aria-labelledby="concepts-heading">
        <h2 id="concepts-heading" className="text-xl font-semibold">Concepts to revisit</h2>
        {weakest.length === 0 ? (
          <p className="mt-2 text-gray-600">Answer a few more questions to see which concepts need work.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {weakest.map((s) => {
              const anchor = conceptAnchor(s.domain, s.concept)
              return (
                <li key={s.concept}>
                  {anchor ? <a className="text-blue-700 underline" href={`#${anchor}`}>{s.concept}</a> : s.concept}
                  <span className="text-sm text-gray-600"> · {s.correct} of {s.total} correct</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <ResetProgress onReset={onReset} />
    </div>
  )
}

function ResetProgress({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)
  if (!confirming) {
    return (
      <button type="button" className="text-sm text-red-700 underline" onClick={() => setConfirming(true)}>
        Reset all progress
      </button>
    )
  }
  return (
    <div role="alertdialog" aria-labelledby="reset-text" className="rounded border border-red-300 p-4">
      <p id="reset-text">This deletes every recorded drill, exam, lab check, and walkthrough visit on this device. It can't be undone.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className={button} onClick={() => { onReset(); setConfirming(false) }}>
          Delete my progress
        </button>
        <button type="button" className="rounded border border-gray-400 px-4 py-2" onClick={() => setConfirming(false)}>
          Keep it
        </button>
      </div>
    </div>
  )
}
