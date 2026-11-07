import { useSyncExternalStore } from 'react'
import { content } from './content.ts'
import { parseRoute } from './lib/route.ts'
import { Drill } from './pages/Drill.tsx'
import { Exam } from './pages/Exam.tsx'
import { Lab } from './pages/Lab.tsx'
import { Walkthrough } from './pages/Walkthrough.tsx'

const pages = [
  { id: 'drill', label: 'Domain drill' },
  { id: 'exam', label: 'Mock exam' },
  { id: 'walkthrough', label: 'Walkthroughs' },
  { id: 'lab', label: 'Labs' },
] as const

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function App() {
  const route = parseRoute(useSyncExternalStore(subscribe, () => window.location.hash))
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">CCA Mock Exam</h1>
      <nav aria-label="Modes" className="mt-4 flex flex-wrap gap-x-2 border-b">
        {pages.map((p) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            aria-current={route.page === p.id ? 'page' : undefined}
            className={`-mb-px border-b-2 px-3 py-2 font-medium ${
              route.page === p.id ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-600'
            }`}
          >
            {p.label}
          </a>
        ))}
      </nav>
      {/* Drill and exam stay mounted so switching pages never loses a running exam or its timer. */}
      <div className="mt-6" hidden={route.page !== 'drill'}>
        <Drill domains={content.domains} questions={content.questions} />
      </div>
      <div className="mt-6" hidden={route.page !== 'exam'}>
        <Exam domains={content.domains} questions={content.questions} />
      </div>
      {route.page === 'walkthrough' && (
        <div className="mt-6">
          <Walkthrough
            walkthroughs={content.walkthroughs}
            domains={content.domains}
            domainId={route.domainId}
            anchor={route.anchor}
          />
        </div>
      )}
      {route.page === 'lab' && (
        <div className="mt-6">
          <Lab labs={content.labs} domains={content.domains} domainId={route.domainId} />
        </div>
      )}
    </main>
  )
}

export default App
