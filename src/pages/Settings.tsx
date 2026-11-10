import { useState } from 'react'
import { button } from '../components/QuestionCard.tsx'
import refreshStatus from '../../content/refresh-status.json'
import schedule from '../../content/schedule.json'
import { RefreshStatusSchema } from '../lib/refresh.ts'
import { describeSchedule, nextRunAt, ScheduleSchema } from '../lib/schedule.ts'

const workflowUrl = 'https://github.com/kamalsoft/CCAMockExamApp/actions/workflows/refresh-bank.yml'

// The schedule and the last publish come from content/ at build time. Changing the schedule is a
// pull request, and "Run a refresh" opens GitHub's Run workflow page, where the run history is.
export default function SettingsPage({ bank }: { bank: { version: number; published_at: string } }) {
  const current = ScheduleSchema.parse(schedule)
  const last = RefreshStatusSchema.parse(refreshStatus)
  const [now] = useState(() => new Date())
  const next = nextRunAt(current, now)

  return (
    <section aria-labelledby="settings-heading">
      <h2 id="settings-heading" className="text-xl font-semibold">Question bank refresh</h2>
      <p className="mt-2 text-sm text-gray-600">
        The question bank is version {bank.version}, published {bank.published_at}. A refresh adds reviewed
        questions in a pull request. The app shows them after that pull request is merged and the site is redeployed.
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium">Schedule</dt>
          <dd>{describeSchedule(current)}</dd>
        </div>
        <div>
          <dt className="font-medium">Next scheduled check</dt>
          <dd>{next.toUTCString()} ({next.toLocaleString()} your time)</dd>
        </div>
        <div>
          <dt className="font-medium">Last published</dt>
          <dd>{last.lastPublishedAt ? new Date(last.lastPublishedAt).toLocaleString() : 'Never'}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={workflowUrl} className={button}>Run a refresh on GitHub</a>
        {last.runUrl && (
          <a href={last.runUrl} className="rounded border border-gray-400 px-4 py-2 font-medium hover:bg-gray-100">
            Log of the last publish
          </a>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Changing the schedule means editing content/schedule.json in a pull request.
      </p>
    </section>
  )
}
