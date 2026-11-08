import { useCallback, useState } from 'react'
import { button } from '../components/QuestionCard.tsx'
import type { Settings, Week } from '../lib/settings.ts'
import { localStorageSettingsRepository } from '../lib/settings.ts'
import { useTheme } from '../contexts/ThemeContext.tsx'

const secondary = 'rounded border border-gray-400 px-4 py-2 font-medium hover:bg-gray-100'

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const weeksOfMonth: Week[] = ['1st', '2nd', '3rd', '4th', 'last']

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
  const setDayOfWeek = useCallback((value: typeof settings.dayOfWeek) =>
    onChange({ ...settings, dayOfWeek: value }), [settings, onChange])
  const setDayOfMonth = useCallback((value: Settings['dayOfMonth']) =>
    onChange({ ...settings, dayOfMonth: value }), [settings, onChange])
  const setWeekOfMonth = useCallback((value: Week) =>
    onChange({ ...settings, weekOfMonth: value }), [settings, onChange])

  const refreshNow = () => {
    const next = { ...settings, lastRefreshAt: new Date().toISOString() }
    onChange(next)
    repository.save(next)
    setStatus(`Refresh checked at ${new Date().toLocaleTimeString()}. Bank version ${bank.version} is current.`)
  }

  const loadNewer = () => {
    window.location.reload()
  }

  const { theme, toggleTheme } = useTheme()

  // Get the next scheduled run time for display
  const getNextRunInfo = () => {
    // This is a simplified display - in production would calculate actual next run
    if (settings.refreshPeriod === 'weekly') {
      return `Every ${settings.dayOfWeek.charAt(0).toUpperCase() + settings.dayOfWeek.slice(1)} at ${settings.scheduleTime}`
    } else {
      return `On the ${settings.weekOfMonth === 'last' ? 'last' : settings.weekOfMonth} day of the month at ${settings.scheduleTime}`
    }
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
          {settings.refreshPeriod === 'weekly' && (
            <div className="ml-4 space-y-2">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Day:</label>
                <select
                  className="rounded border border-gray-400 px-2 py-1 text-sm"
                  value={settings.dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as typeof settings.dayOfWeek)}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={settings.refreshPeriod === 'monthly'}
              onChange={() => setPeriod('monthly')}
            />
            <span>Monthly</span>
          </label>
          {settings.refreshPeriod === 'monthly' && (
            <div className="ml-4 space-y-2">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Week:</label>
                <select
                  className="rounded border border-gray-400 px-2 py-1 text-sm"
                  value={settings.weekOfMonth}
                  onChange={(e) => setWeekOfMonth(e.target.value as Week)}
                >
                  {weeksOfMonth.map((week) => (
                    <option key={week} value={week}>
                      {week === 'last' ? 'Last" week' : week}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Day:</label>
                <select
                  className="rounded border border-gray-400 px-2 py-1 text-sm"
                  value={settings.dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value as Settings['dayOfMonth'])}
                >
                  {Array.from({ length: 28 }, (_, i) => String(i + 1)).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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

      <fieldset className="mt-6">
        <legend className="font-semibold">Appearance</legend>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className={secondary}
            onClick={toggleTheme}
          >
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
          </button>
          <span className="text-sm text-gray-600">({theme === 'light' ? '☀️' : '🌙'})</span>
        </div>
      </fieldset>

      <p className="mt-4 text-sm text-gray-600">
        Next scheduled run: {getNextRunInfo()}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Last checked: {settings.lastRefreshAt ? new Date(settings.lastRefreshAt).toLocaleString() : 'Never'}
        {settings.lastRefreshAt === null && <span> — if the scheduled refresh can't run, the app keeps the current bank.</span>}
      </p>
    </section>
  )
}