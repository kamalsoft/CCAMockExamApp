import { useState } from 'react'
import type { Domain } from '../lib/schema.ts'

const USER_KEY = 'cca-user-v1'

export function Home({ domains, bank }: { domains: Domain[]; bank: { version: number; published_at: string } }) {
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem(USER_KEY) ?? undefined
    } catch {
      return undefined
    }
  })

  const logout = () => {
    try {
      localStorage.removeItem(USER_KEY)
      setUserName(undefined)
    } catch {
      // Storage might be blocked
    }
  }

  const saveName = (name: string) => {
    try {
      localStorage.setItem(USER_KEY, name)
      setUserName(name)
    } catch {
      // Storage might be blocked
    }
  }

  // Simple inline name input
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(userName ?? '')

  return (
    <div className="space-y-6">
      {/* User welcome section */}
      <div className="flex items-center justify-between">
        {userName ? (
          <h2 className="text-lg font-semibold text-gray-700">
            Welcome back, {userName}!
          </h2>
        ) : (
          <h2 className="text-lg font-semibold text-gray-700">Welcome to CCA Mock Exam</h2>
        )}
        {userName && (
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Logout
          </button>
        )}
        {!userName && (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            Set your name
          </button>
        )}
      </div>

      {/* Name input modal */}
      {editingName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">What should we call you?</h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditingName(false)
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveName(tempName.trim())
                  setEditingName(false)
                }}
                disabled={!tempName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-700">Get started with a mode</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Mock Exam Card */}
        <a
          href="#exam"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Mock Exam</h3>
          <p className="mt-1 text-sm text-gray-600">
            Take a timed 60-question practice exam. Simulates the real exam conditions.
          </p>
        </a>

        {/* Question Bank Card */}
        <a
          href="#bank"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
          <p className="mt-1 text-sm text-gray-600">
            {bank.version} questions available (published {new Date(bank.published_at).toLocaleDateString()}).
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Update schedule:</span>
              <span>weekly</span>
            </div>
          </div>
        </a>

        {/* Domain Drill Card */}
        <a
          href="#drill"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Domain Drill</h3>
          <p className="mt-1 text-sm text-gray-600">
            Practice questions from specific domains. Focus on areas you need to improve.
          </p>
        </a>

        {/* Walkthroughs Card */}
        <a
          href="#walkthrough"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Walkthroughs</h3>
          <p className="mt-1 text-sm text-gray-600">
            Study guides for each domain. Review key concepts and common pitfalls.
          </p>
        </a>

        {/* Labs Card */}
        <a
          href="#lab"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Labs</h3>
          <p className="mt-1 text-sm text-gray-600">
            Hands-on exercises using the Claude Agent SDK and Claude Code.
          </p>
        </a>

        {/* Progress Card */}
        <a
          href="#progress"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          <p className="mt-1 text-sm text-gray-600">
            View your practice history, results, and readiness for the exam.
          </p>
        </a>

        {/* Settings Card */}
        <a
          href="#settings"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
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