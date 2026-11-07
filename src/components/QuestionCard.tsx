import { useId } from 'react'
import type { Question } from '../lib/schema.ts'

export const button = 'rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:bg-gray-400'

// Scenario, question and answer inputs: radios for single answers, checkboxes for multi.
export function QuestionCard({ question, selected, onChange, disabled = false }: {
  question: Question
  selected: string[]
  onChange: (selected: string[]) => void
  disabled?: boolean
}) {
  // Unique per card: drill and exam stay mounted together and may show the same question.
  const group = useId()
  const multi = question.type === 'multi'
  const toggle = (key: string) =>
    onChange(multi ? (selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]) : [key])

  return (
    <>
      {question.scenario && <p className="mt-3">{question.scenario}</p>}
      <fieldset className="mt-4" disabled={disabled}>
        <legend className="font-semibold">{question.question}</legend>
        {question.options.map((o) => (
          <label key={o.key} className="mt-2 flex items-start gap-2">
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={group}
              className="mt-1"
              checked={selected.includes(o.key)}
              onChange={() => toggle(o.key)}
            />
            <span>
              <strong>{o.key}.</strong> {o.text}
            </span>
          </label>
        ))}
      </fieldset>
    </>
  )
}
