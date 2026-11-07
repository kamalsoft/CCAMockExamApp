import type { Question } from './schema.ts'

export type Difficulty = Question['difficulty'] | 'any'
export type Responses = Record<string, string[]>
export type DomainScore = { correct: number; total: number }

export function selectQuestions(
  questions: Question[],
  domainIds: string[],
  difficulty: Difficulty,
  random = Math.random,
): Question[] {
  const matching = questions.filter(
    (q) => domainIds.includes(q.domain) && (difficulty === 'any' || q.difficulty === difficulty),
  )
  // Fisher-Yates shuffle so repeated drills don't always run in the same order.
  for (let i = matching.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[matching[i], matching[j]] = [matching[j], matching[i]]
  }
  return matching
}

// Correct only when the selected keys are exactly the answer keys, in any order.
export function isCorrect(question: Question, selected: string[]): boolean {
  return selected.length === question.answer.length && question.answer.every((k) => selected.includes(k))
}

export function scoreByDomain(questions: Question[], responses: Responses): Record<string, DomainScore> {
  const scores: Record<string, DomainScore> = {}
  for (const q of questions) {
    scores[q.domain] ??= { correct: 0, total: 0 }
    scores[q.domain].total++
    if (isCorrect(q, responses[q.id] ?? [])) scores[q.domain].correct++
  }
  return scores
}
