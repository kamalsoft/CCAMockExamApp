import type { Question } from '../lib/schema.ts'

// Correct reasoning first, then a short note on each distractor.
export function Explanation({ question }: { question: Question }) {
  const optionText = (key: string) => question.options.find((o) => o.key === key)?.text
  return (
    <div className="mt-4 rounded border border-gray-300 bg-gray-50 p-4 text-sm">
      <p>
        <strong>Correct: {question.answer.join(', ')}.</strong> {question.explanation.correct}
      </p>
      <ul className="mt-3 space-y-2">
        {Object.entries(question.explanation.distractors).map(([key, why]) => (
          <li key={key}>
            <strong>{key}.</strong> <span className="text-gray-600">{optionText(key)}</span> {why}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-gray-600">Concepts: {question.concepts.join(', ')}</p>
    </div>
  )
}
