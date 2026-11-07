import { useState } from 'react'
import content from 'virtual:content'
import { Drill } from './pages/Drill.tsx'
import { Exam } from './pages/Exam.tsx'

const pages = [
  { id: 'drill', label: 'Domain drill' },
  { id: 'exam', label: 'Mock exam' },
] as const

function App() {
  const [page, setPage] = useState<(typeof pages)[number]['id']>('drill')
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">CCA Mock Exam</h1>
      <nav aria-label="Modes" className="mt-4 flex gap-2 border-b">
        {pages.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-current={page === p.id ? 'page' : undefined}
            onClick={() => setPage(p.id)}
            className={`-mb-px border-b-2 px-3 py-2 font-medium ${
              page === p.id ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </nav>
      {/* Both pages stay mounted so switching modes never loses a running exam or its timer. */}
      <div className="mt-6" hidden={page !== 'drill'}>
        <Drill domains={content.domains} questions={content.questions} />
      </div>
      <div className="mt-6" hidden={page !== 'exam'}>
        <Exam domains={content.domains} questions={content.questions} />
      </div>
    </main>
  )
}

export default App
