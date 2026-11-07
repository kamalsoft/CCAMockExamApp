import { useState } from 'react'
import { Explanation } from '../components/Explanation.tsx'
import { isCorrect, scoreByDomain, selectQuestions, type Difficulty, type Responses } from '../lib/drill.ts'
import type { Domain, Question } from '../lib/schema.ts'

type Props = { domains: Domain[]; questions: Question[] }
type Settings = { domainIds: string[]; difficulty: Difficulty; explainImmediately: boolean }

const button = 'rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:bg-gray-400'

export function Drill({ domains, questions }: Props) {
  const [settings, setSettings] = useState<Settings>({ domainIds: [], difficulty: 'any', explainImmediately: true })
  const [set, setSet] = useState<Question[] | null>(null)
  const [responses, setResponses] = useState<Responses>({})

  if (!set) {
    return (
      <Setup
        domains={domains}
        questions={questions}
        settings={settings}
        onChange={setSettings}
        onStart={() => {
          setResponses({})
          setSet(selectQuestions(questions, settings.domainIds, settings.difficulty))
        }}
      />
    )
  }
  const index = Object.keys(responses).length
  if (index < set.length) {
    return (
      <QuestionView
        key={set[index].id}
        question={set[index]}
        position={`Question ${index + 1} of ${set.length}`}
        domainName={domains.find((d) => d.id === set[index].domain)?.name}
        explainImmediately={settings.explainImmediately}
        onAnswer={(selected) => setResponses({ ...responses, [set[index].id]: selected })}
      />
    )
  }
  return <Results domains={domains} questions={set} responses={responses} onRestart={() => setSet(null)} />
}

function Setup({ domains, questions, settings, onChange, onStart }: Props & {
  settings: Settings
  onChange: (s: Settings) => void
  onStart: () => void
}) {
  const matching = selectQuestions(questions, settings.domainIds, settings.difficulty).length
  const toggleDomain = (id: string) =>
    onChange({
      ...settings,
      domainIds: settings.domainIds.includes(id)
        ? settings.domainIds.filter((d) => d !== id)
        : [...settings.domainIds, id],
    })

  return (
    <section aria-labelledby="setup-heading">
      <h2 id="setup-heading" className="text-xl font-semibold">Domain drill</h2>
      <fieldset className="mt-4">
        <legend className="font-medium">Domains</legend>
        {domains.map((d) => {
          const count = questions.filter((q) => q.domain === d.id).length
          return (
            <label key={d.id} className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.domainIds.includes(d.id)}
                disabled={count === 0}
                onChange={() => toggleDomain(d.id)}
              />
              <span className={count === 0 ? 'text-gray-400' : ''}>
                {d.name} ({count} {count === 1 ? 'question' : 'questions'})
              </span>
            </label>
          )
        })}
      </fieldset>

      <label className="mt-4 block">
        <span className="font-medium">Difficulty</span>
        <select
          className="ml-2 rounded border border-gray-400 px-2 py-1"
          value={settings.difficulty}
          onChange={(e) => onChange({ ...settings, difficulty: e.target.value as Difficulty })}
        >
          <option value="any">Any</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <label className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.explainImmediately}
          onChange={(e) => onChange({ ...settings, explainImmediately: e.target.checked })}
        />
        Show the explanation right after each answer (otherwise at the end)
      </label>

      <p className="mt-4 text-gray-600" aria-live="polite">
        {matching} {matching === 1 ? 'question matches' : 'questions match'}
      </p>
      <button type="button" className={`${button} mt-2`} disabled={matching === 0} onClick={onStart}>
        Start drill
      </button>
    </section>
  )
}

function QuestionView({ question, position, domainName, explainImmediately, onAnswer }: {
  question: Question
  position: string
  domainName?: string
  explainImmediately: boolean
  onAnswer: (selected: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const multi = question.type === 'multi'
  const toggle = (key: string) =>
    setSelected(multi ? (selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]) : [key])

  const submit = () => (explainImmediately ? setSubmitted(true) : onAnswer(selected))

  return (
    <section aria-labelledby="question-heading">
      <p className="text-sm text-gray-600">
        {position} · {domainName} · {question.difficulty}
      </p>
      {question.scenario && <p className="mt-3">{question.scenario}</p>}
      <fieldset className="mt-4" disabled={submitted}>
        <legend id="question-heading" className="font-semibold">{question.question}</legend>
        {question.options.map((o) => (
          <label key={o.key} className="mt-2 flex items-start gap-2">
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={question.id}
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

      {!submitted && (
        <button type="button" className={`${button} mt-4`} disabled={selected.length === 0} onClick={submit}>
          Submit answer
        </button>
      )}
      {submitted && (
        <div role="status">
          <p className={`mt-4 font-semibold ${isCorrect(question, selected) ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect(question, selected) ? 'Correct' : 'Incorrect'}
          </p>
          <Explanation question={question} />
          <button type="button" className={`${button} mt-4`} onClick={() => onAnswer(selected)}>
            Next
          </button>
        </div>
      )}
    </section>
  )
}

function Results({ domains, questions, responses, onRestart }: {
  domains: Domain[]
  questions: Question[]
  responses: Responses
  onRestart: () => void
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
        New drill
      </button>
    </section>
  )
}
