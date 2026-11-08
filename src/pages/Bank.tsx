import { useState } from 'react'
import type { Domain, Question } from '../lib/schema.ts'

type Props = {
  domains: Domain[]
  questions: Question[]
  bank: { version: number; published_at: string }
}

export function Bank({ domains, questions, bank }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const questionsByDomain = domains.map((d) => ({
    id: d.id,
    name: d.name,
    count: questions.filter((q) => q.domain === d.id).length,
    weight: d.weight,
  }))

  return (
    <section aria-labelledby="bank-heading">
      <div className="flex items-center justify-between">
        <h2 id="bank-heading" className="text-xl font-semibold">Question Bank</h2>
        <a href="#home" className="text-sm text-gray-600 hover:text-blue-700">← Home</a>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Bank version {bank.version}, published {new Date(bank.published_at).toLocaleDateString()}.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          {questions.length} total questions covering {domains.length} domains.
        </p>
      </div>

      <button
        type="button"
        className="mt-4 rounded border border-gray-400 px-4 py-2 font-medium hover:bg-gray-100"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide domain breakdown' : 'View domain breakdown'}
      </button>

      {showDetails && (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1">Domain</th>
              <th className="py-1">Questions</th>
              <th className="py-1">Exam Weight</th>
            </tr>
          </thead>
          <tbody>
            {questionsByDomain.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="py-1">{d.name}</td>
                <td className="py-1">{d.count}</td>
                <td className="py-1">{d.weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6">
        <a
          href="#drill"
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
        >
          Practice questions from this bank →
        </a>
      </div>
    </section>
  )
}