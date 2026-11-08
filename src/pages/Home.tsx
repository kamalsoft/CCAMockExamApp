import type { Domain } from '../lib/schema.ts'

export function Home({ domains }: { domains: Domain[] }) {
  return (
    <div className="space-y-6">
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