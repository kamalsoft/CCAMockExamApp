import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { content } from './content.ts'
import { emptyProgress, localStorageRepository, recordAttempt, type Attempt, type DrillSnapshot } from './lib/progress.ts'
import { parseRoute } from './lib/route.ts'
import { Bank } from './pages/Bank.tsx'
import { Drill } from './pages/Drill.tsx'
import { Exam } from './pages/Exam.tsx'
import { Home } from './pages/Home.tsx'
import { Lab } from './pages/Lab.tsx'
import { Progress } from './pages/Progress.tsx'
import SettingsPage from './pages/Settings.tsx'
import { Walkthrough } from './pages/Walkthrough.tsx'

const pages = [
  { id: 'drill', label: 'Domain drill' },
  { id: 'exam', label: 'Mock exam' },
  { id: 'walkthrough', label: 'Walkthroughs' },
  { id: 'lab', label: 'Labs' },
  { id: 'progress', label: 'Progress' },
  { id: 'bank', label: 'Question Bank' },
  { id: 'settings', label: 'Settings' },
] as const

const repository = localStorageRepository()

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function App() {
  const route = parseRoute(useSyncExternalStore(subscribe, () => window.location.hash))
  const [progress, setProgress] = useState(() => repository.load())
  useEffect(() => repository.save(progress), [progress])

  // Stable callbacks, so pages can list them as effect dependencies without re-running.
  const onComplete = useCallback((attempt: Attempt) => setProgress((p) => recordAttempt(p, attempt)), [])
  const onSaveDrill = useCallback((drill: DrillSnapshot | null) => setProgress((p) => ({ ...p, drill })), [])
  const onSeen = useCallback(
    (domainId: string) => setProgress((p) => ({ ...p, walkthroughsSeen: { ...p.walkthroughsSeen, [domainId]: new Date().toISOString() } })),
    [],
  )
  const onLabChange = useCallback(
    (domainId: string, done: boolean) => setProgress((p) => ({ ...p, labsCompleted: { ...p.labsCompleted, [domainId]: done } })),
    [],
  )

  // Home page shown when on home route (empty hash or #home)
  if (route.page === 'home') {
    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold">CCA Mock Exam</h1>
        <Home domains={content.domains} bank={content.bank} questionCount={content.questions.length} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
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
        <Drill
          domains={content.domains}
          questions={content.questions}
          saved={progress.drill}
          domainId={route.page === 'drill' ? route.domainId : undefined}
          onSave={onSaveDrill}
          onComplete={onComplete}
        />
      </div>
      <div className="mt-6" hidden={route.page !== 'exam'}>
        <Exam domains={content.domains} questions={content.questions} onComplete={onComplete} />
      </div>
      {route.page === 'walkthrough' && (
        <div className="mt-6">
          <Walkthrough
            walkthroughs={content.walkthroughs}
            domains={content.domains}
            domainId={route.domainId}
            anchor={route.anchor}
            onSeen={onSeen}
          />
        </div>
      )}
      {route.page === 'lab' && (
        <div className="mt-6">
          <Lab
            labs={content.labs}
            domains={content.domains}
            domainId={route.domainId}
            completed={progress.labsCompleted}
            onCompletedChange={onLabChange}
          />
        </div>
      )}
      {route.page === 'progress' && (
        <div className="mt-6">
          <Progress
            progress={progress}
            domains={content.domains}
            bank={content.bank}
            questions={content.questions}
            onReset={() => setProgress(emptyProgress())}
          />
        </div>
      )}
      {route.page === 'bank' && (
        <div className="mt-6">
          <Bank
            domains={content.domains}
            questions={content.questions}
            bank={content.bank}
          />
        </div>
      )}
      {route.page === 'settings' && (
        <div className="mt-6">
          <SettingsPage bank={content.bank} />
        </div>
      )}
    </main>
  )
}

export default App
