import { useState, type FormEvent } from 'react'
import { button } from '../components/QuestionCard.tsx'
import type { Domain } from '../lib/schema.ts'

const NAME_KEY = 'cca-user-v1'

// Session storage: the name lasts for this browser tab, and logout clears it.
const readName = () => {
  try {
    return sessionStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

const cardClass = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow'

export function Home({ domains, bank, questionCount }: {
  domains: Domain[]
  bank: { version: number; published_at: string }
  questionCount: number
}) {
  const [name, setName] = useState(readName)
  const [draft, setDraft] = useState('')

  const save = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    try {
      sessionStorage.setItem(NAME_KEY, trimmed)
    } catch {
      // Storage blocked: the name lasts until the page reloads.
    }
    setName(trimmed)
  }

  const logout = () => {
    try {
      sessionStorage.removeItem(NAME_KEY)
    } catch {
      // Nothing stored, nothing to clear.
    }
    setName('')
    setDraft('')
  }

  if (!name) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Welcome to CCA Mock Exam</h2>
        <form onSubmit={save} className="max-w-sm space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <label htmlFor="name" className="block font-medium">What should we call you?</label>
          <input
            id="name"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded border border-gray-400 px-3 py-2"
            autoFocus
          />
          <button type="submit" className={button} disabled={!draft.trim()}>
            Continue
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Welcome back, {name}!</h2>
        <button type="button" onClick={logout} className="text-sm text-gray-500 hover:text-red-600">
          Log out
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-700">Get started with a mode</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a href="#exam" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Mock Exam</h3>
          <p className="mt-1 text-sm text-gray-600">
            Take a timed 60-question practice exam. Simulates the real exam conditions.
          </p>
        </a>

        <a href="#bank" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
          <p className="mt-1 text-sm text-gray-600">
            {questionCount} questions · version {bank.version}, published {bank.published_at}.
          </p>
        </a>

        <a href="#drill" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Domain Drill</h3>
          <p className="mt-1 text-sm text-gray-600">
            Practice questions from specific domains. Focus on areas you need to improve.
          </p>
        </a>

        <a href="#walkthrough" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Walkthroughs</h3>
          <p className="mt-1 text-sm text-gray-600">
            Study guides for each domain. Review key concepts and common pitfalls.
          </p>
        </a>

        <a href="#lab" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Labs</h3>
          <p className="mt-1 text-sm text-gray-600">
            Hands-on exercises using the Claude Agent SDK and Claude Code.
          </p>
        </a>

        <a href="#progress" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          <p className="mt-1 text-sm text-gray-600">
            View your practice history, results, and readiness for the exam.
          </p>
        </a>

        <a href="#settings" className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <p className="mt-1 text-sm text-gray-600">
            Configure exam settings and question bank refresh preferences.
          </p>
        </a>
      </div>

      {/* Quick domain access - only show on larger screens */}
      <section className="hidden sm:block">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">By Domain</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <a
              key={d.id}
              href={`#drill?domain=${d.id}`}
              className="rounded border border-gray-200 bg-gray-50 p-3 text-sm hover:bg-gray-100"
            >
              <span className="font-medium text-gray-900">{d.id}: {d.name}</span>
              <span className="block text-xs text-gray-600">
                {d.weight}% of exam • Start drilling
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
