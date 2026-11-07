import { isCorrect, scoreByDomain, type Responses } from '../lib/drill.ts'
import type { Domain, Question } from '../lib/schema.ts'
import { Explanation } from './Explanation.tsx'
import { button } from './QuestionCard.tsx'

export function Results({ domains, questions, responses, restartLabel, onRestart, children }: {
  domains: Domain[]
  questions: Question[]
  responses: Responses
  restartLabel: string
  onRestart: () => void
  children?: React.ReactNode
}) {
  const byDomain = scoreByDomain(questions, responses)
  const correct = Object.values(byDomain).reduce((sum, s) => sum + s.correct, 0)
  const percent = (n: number, total: number) => Math.round((n / total) * 100)

  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading" className="text-xl font-semibold">Results</h2>
      <p className="mt-2 text-lg">
        {correct} of {questions.length} correct ({percent(correct, questions.length)}%)
      </p>
      {children}

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-1">Domain</th>
            <th className="py-1">Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(byDomain).map(([id, s]) => (
            <tr key={id} className="border-b">
              <td className="py-1">{domains.find((d) => d.id === id)?.name ?? id}</td>
              <td className="py-1">
                {s.correct} / {s.total} ({percent(s.correct, s.total)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-6 font-semibold">Review</h3>
      <ol className="mt-2 space-y-6">
        {questions.map((q) => {
          const answer = responses[q.id] ?? []
          return (
            <li key={q.id}>
              <p className="font-medium">{q.question}</p>
              <p className={`text-sm ${isCorrect(q, answer) ? 'text-green-700' : 'text-red-700'}`}>
                Your answer: {answer.join(', ') || 'none'} · {isCorrect(q, answer) ? 'Correct' : 'Incorrect'}
              </p>
              <Explanation question={q} />
            </li>
          )
        })}
      </ol>

      <button type="button" className={`${button} mt-6`} onClick={onRestart}>
        {restartLabel}
      </button>
    </section>
  )
}
