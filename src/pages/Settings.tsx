import { useCallback, useState } from 'react'
import { button } from '../components/QuestionCard.tsx'
import type { Settings } from '../lib/settings.ts'
import { localStorageSettingsRepository } from '../lib/settings.ts'

const secondary = 'rounded border border-gray-400 px-4 py-2 font-medium hover:bg-gray-100'

// The app is static: the bank is whatever the current build serves. The scheduled refresh job runs
// outside the app (a GitHub Actions cron) and publishes a newer bank on redeploy. The configuration
// screen records when the learner last checked, so the app can tell them a newer bank is waiting.
export default function SettingsPage({ settings, bank, onChange }: {
  settings: Settings
  bank: { version: number; published_at: string }
  onChange: (settings: Settings) => void
}) {
  const repository = localStorageSettingsRepository()
  const [status, setStatus] = useState<string | null>(null)

  const newerAvailable = bank.published_at > (settings.lastRefreshAt ?? '')

  const setPeriod = useCallback((period: Settings['refreshPeriod']) =>
    onChange({ ...settings, refreshPeriod: period }), [settings, onChange])
  const setTime = useCallback((value: string) =>
    onChange({ ...settings, scheduleTime: value }), [settings, onChange])

  const refreshNow = () => {
    const next = { ...settings, lastRefreshAt: new Date().toISOString() }
    onChange(next)
    repository.save(next)
    setStatus(`Refresh checked at ${new Date().toLocaleTimeString()}. Bank version ${bank.version} is current.`)
  }

  const loadNewer = () => {
    window.location.reload()
  }

  return (
    <section aria-labelledby="settings-heading">
      <div className="flex items-center justify-between">
        <h2 id="settings-heading" className="text-xl font-semibold">Bank refresh settings</h2>
        <a href="#home" className="text-sm text-gray-600 hover:text-blue-700">← Home</a>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        The question bank is version {bank.version}, published {bank.published_at}. The app keeps the
        current bank until a redeploy brings a newer one; no code runs in the browser and no API key
        is needed.
      </p>

      <fieldset className="mt-4">
        <legend className="font-semibold">Refresh schedule</legend>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={settings.refreshPeriod === 'weekly'}
              onChange={() => setPeriod('weekly')}
            />
            <span>Weekly</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={settings.refreshPeriod === 'monthly'}
              onChange={() => setPeriod('monthly')}
            />
            <span>Monthly</span>
          </label>
          <label className="mt-2 flex items-center gap-2">
            <span className="font-medium">Time of day</span>
            <input
              type="time"
              className="ml-2 rounded border border-gray-400 px-2 py-1"
              value={settings.scheduleTime}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={`${button} mt-2`} onClick={refreshNow}>
          Refresh now
        </button>
        {newerAvailable && (
          <button type="button" className={`${secondary} mt-2`} onClick={loadNewer}>
            Load newer bank (version {bank.version})
          </button>
        )}
      </div>

      {status && <p role="status" className="mt-4 text-sm text-gray-600">{status}</p>}

      {newerAvailable && !status && (
        <p className="mt-2 text-sm text-blue-700">
          A newer question bank (version {bank.version}, published {bank.published_at}) is available.
          Reload to load it; your progress is kept.
        </p>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Last checked: {settings.lastRefreshAt ? new Date(settings.lastRefreshAt).toLocaleString() : 'Never'}
        {settings.lastRefreshAt === null && <span> — if the scheduled refresh can’t run, the app keeps the current bank.</span>}
      </p>
    </section>
  )
}
