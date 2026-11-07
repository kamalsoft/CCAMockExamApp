import { useState } from 'react'
import { Explanation } from '../components/Explanation.tsx'
import { button, QuestionCard } from '../components/QuestionCard.tsx'
import { Results } from '../components/Results.tsx'
import { isCorrect, selectQuestions, type Difficulty, type Responses } from '../lib/drill.ts'
import { makeAttempt, type Attempt } from '../lib/progress.ts'
import type { Domain, Question } from '../lib/schema.ts'

type Props = { domains: Domain[]; questions: Question[] }
type Settings = { domainIds: string[]; difficulty: Difficulty; explainImmediately: boolean }

export function Drill({ domains, questions, onComplete }: Props & { onComplete: (attempt: Attempt) => void }) {
  const [settings, setSettings] = useState<Settings>({ domainIds: [], difficulty: 'any', explainImmediately: true })
  const [set, setSet] = useState<Question[] | null>(null)
  const [responses, setResponses] = useState<Responses>({})
  const [startedAt, setStartedAt] = useState(0)

  if (!set) {
    return (
      <Setup
        domains={domains}
        questions={questions}
        settings={settings}
        onChange={setSettings}
        onStart={() => {
          setResponses({})
          setStartedAt(Date.now())
          setSet(selectQuestions(questions, settings.domainIds, settings.difficulty))
        }}
      />
    )
  }
  const answer = (id: string, selected: string[]) => {
    const next = { ...responses, [id]: selected }
    setResponses(next)
    if (Object.keys(next).length === set.length) onComplete(makeAttempt('drill', set, next, startedAt, false))
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
        onAnswer={(selected) => answer(set[index].id, selected)}
      />
    )
  }
  return (
    <Results
      domains={domains}
      questions={set}
      responses={responses}
      restartLabel="New drill"
      onRestart={() => setSet(null)}
    />
  )
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
  const submit = () => (explainImmediately ? setSubmitted(true) : onAnswer(selected))

  return (
    <section>
      <p className="text-sm text-gray-600">
        {position} · {domainName} · {question.difficulty}
      </p>
      <QuestionCard question={question} selected={selected} onChange={setSelected} disabled={submitted} />

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
