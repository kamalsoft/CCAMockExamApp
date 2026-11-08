import { useEffect, useMemo, useRef, useState } from 'react'
import { button, QuestionCard } from '../components/QuestionCard.tsx'
import { Results } from '../components/Results.tsx'
import type { Responses } from '../lib/drill.ts'
import { assembleExam, EXAM_ITEMS, EXAM_MINUTES, formatTime, remainingSeconds } from '../lib/exam.ts'
import { makeAttempt, type Attempt } from '../lib/progress.ts'
import type { Domain, Question } from '../lib/schema.ts'

type Props = { domains: Domain[]; questions: Question[] }
type Run = { questions: Question[]; startedAt: number; endsAt: number }

const secondary = 'rounded border border-gray-400 px-4 py-2 font-medium hover:bg-gray-100 disabled:text-gray-400'

export function Exam({ domains, questions, onComplete }: Props & { onComplete: (attempt: Attempt) => void }) {
  const preview = useMemo(() => assembleExam(questions, domains), [questions, domains])
  const [run, setRun] = useState<Run | null>(null)
  const [responses, setResponses] = useState<Responses>({})
  const [flagged, setFlagged] = useState<string[]>([])
  const [finished, setFinished] = useState<'manual' | 'timeout' | null>(null)

  // Recorded once per run: the attempt id comes from the start time, and saving ignores repeat ids.
  useEffect(() => {
    if (finished && run) {
      onComplete(makeAttempt('exam', run.questions, responses, run.startedAt, run.questions.length === EXAM_ITEMS))
    }
  }, [finished, run, responses, onComplete])

  const start = () => {
    const now = Date.now()
    setResponses({})
    setFlagged([])
    setFinished(null)
    setRun({ questions: assembleExam(questions, domains).questions, startedAt: now, endsAt: now + EXAM_MINUTES * 60_000 })
  }

  if (!run) return <Intro domains={domains} preview={preview} onStart={start} />
  if (finished) {
    const unanswered = run.questions.filter((q) => !responses[q.id]?.length).length
    return (
      <Results
        domains={domains}
        questions={run.questions}
        responses={responses}
        restartLabel="Back to exam start"
        onRestart={() => setRun(null)}
      >
        <div className="mt-4 flex justify-between items-start">
          <p className="text-sm text-gray-600">
            {finished === 'timeout' ? 'Time ran out, so the exam was submitted automatically. ' : ''}
            {unanswered} unanswered (counted as incorrect).
          </p>
          <a href="#home" className="text-sm text-gray-600 hover:text-blue-700">← Home</a>
        </div>
      </Results>
    )
  }
  return (
    <Running
      key={run.endsAt}
      run={run}
      domains={domains}
      responses={responses}
      flagged={flagged}
      onAnswer={(id, selected) => setResponses({ ...responses, [id]: selected })}
      onFlag={(id) => setFlagged(flagged.includes(id) ? flagged.filter((f) => f !== id) : [...flagged, id])}
      onFinish={setFinished}
    />
  )
}

function Intro({ domains, preview, onStart }: {
  domains: Domain[]
  preview: ReturnType<typeof assembleExam>
  onStart: () => void
}) {
  const name = (id: string) => domains.find((d) => d.id === id)?.name ?? id
  const items = preview.questions.length
  return (
    <section aria-labelledby="exam-heading">
      <div className="flex items-center justify-between">
        <h2 id="exam-heading" className="text-xl font-semibold">Mock exam</h2>
        <a href="#home" className="text-sm text-gray-600 hover:text-blue-700">← Home</a>
      </div>
      <p className="mt-2">
        {items} questions · {EXAM_MINUTES} minutes. The timer starts when you begin, and the exam is submitted
        automatically when it reaches zero. Explanations appear only after you submit.
      </p>
      {preview.shortfall.length > 0 && (
        <div role="note" className="mt-4 rounded border border-amber-400 bg-amber-50 p-4 text-sm">
          <p className="font-medium">
            The question bank can't fill a full {EXAM_ITEMS}-question exam yet, so this exam has {items}.
          </p>
          <ul className="mt-2 list-disc pl-5">
            {preview.shortfall.map((s) => (
              <li key={s.domainId}>
                {name(s.domainId)}: {s.available} of {s.target} questions available
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className={`${button} mt-4`} disabled={items === 0} onClick={onStart}>
        Start exam
      </button>
    </section>
  )
}

function Running({ run, domains, responses, flagged, onAnswer, onFlag, onFinish }: {
  run: Run
  domains: Domain[]
  responses: Responses
  flagged: string[]
  onAnswer: (id: string, selected: string[]) => void
  onFlag: (id: string) => void
  onFinish: (how: 'manual' | 'timeout') => void
}) {
  const [index, setIndex] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [confirming, setConfirming] = useState(false)
  const remaining = remainingSeconds(run.endsAt, now)
  const question = run.questions[index]
  const unanswered = run.questions.filter((q) => !responses[q.id]?.length).length
  // Starting the exam unmounts the Start button, so move focus into the exam.
  const top = useRef<HTMLElement>(null)

  useEffect(() => {
    top.current?.focus()
  }, [])
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    if (remaining === 0) onFinish('timeout')
  }, [remaining, onFinish])

  return (
    <section ref={top} tabIndex={-1} className="focus:outline-none">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Question {index + 1} of {run.questions.length} · {domains.find((d) => d.id === question.domain)?.name}
        </span>
        <span role="timer" aria-label="Time remaining" className="font-mono text-base font-semibold text-gray-900">
          {formatTime(remaining)}
        </span>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        selected={responses[question.id] ?? []}
        onChange={(selected) => onAnswer(question.id, selected)}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={secondary} disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Previous
        </button>
        <button
          type="button"
          className={secondary}
          aria-pressed={flagged.includes(question.id)}
          onClick={() => onFlag(question.id)}
        >
          {flagged.includes(question.id) ? 'Unflag' : 'Flag for review'}
        </button>
        <button
          type="button"
          className={secondary}
          disabled={index === run.questions.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Next
        </button>
      </div>

      <nav aria-label="Questions" className="mt-6">
        <ol className="flex flex-wrap gap-2">
          {run.questions.map((q, i) => {
            const answered = !!responses[q.id]?.length
            const isFlagged = flagged.includes(q.id)
            return (
              <li key={q.id}>
                <button
                  type="button"
                  aria-label={`Question ${i + 1}${answered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => setIndex(i)}
                  className={`h-9 w-9 rounded border text-sm ${answered ? 'bg-blue-100' : 'bg-white'} ${
                    i === index ? 'border-blue-700 ring-2 ring-blue-700' : 'border-gray-400'
                  }`}
                >
                  {i + 1}
                  {isFlagged && <span aria-hidden="true">⚑</span>}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="mt-6">
        {!confirming ? (
          <button type="button" className={button} onClick={() => setConfirming(true)}>
            Submit exam
          </button>
        ) : (
          <div role="alertdialog" aria-labelledby="confirm-text" className="rounded border border-gray-400 p-4">
            <p id="confirm-text">
              {unanswered > 0
                ? `You have ${unanswered} unanswered ${unanswered === 1 ? 'question' : 'questions'}. Submit anyway?`
                : 'Submit the exam? You cannot change answers afterward.'}
              {flagged.length > 0 && ` ${flagged.length} flagged for review.`}
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" className={button} onClick={() => onFinish('manual')}>
                Confirm submit
              </button>
              <button type="button" className={secondary} autoFocus onClick={() => setConfirming(false)}>
                Keep working
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
