import content from 'virtual:content'
import { Drill } from './pages/Drill.tsx'

function App() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">CCA Mock Exam</h1>
      <div className="mt-6">
        <Drill domains={content.domains} questions={content.questions} />
      </div>
    </main>
  )
}

export default App
