import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { DomainsSchema, QuestionSchema } from '../src/lib/schema.ts'

type Report = { errors: string[]; warnings: string[] }

const format = (where: string, error: z.ZodError) =>
  error.issues.map((i) => `${where}${i.path.length ? `.${i.path.join('.')}` : ''}: ${i.message}`)

// questionFiles maps a file name like "d1.json" to its parsed JSON.
export function checkContent(domainsJson: unknown, questionFiles: Record<string, unknown>): Report {
  const report: Report = { errors: [], warnings: [] }

  const domains = DomainsSchema.safeParse(domainsJson)
  if (!domains.success) {
    report.errors.push(...format('domains.json', domains.error))
    return report
  }
  const domainIds = domains.data.map((d) => d.id)
  if (new Set(domainIds).size !== domainIds.length) report.errors.push('domains.json: domain ids must be unique')

  const todo = domains.data.filter((d) => d.weight === 'TODO').map((d) => d.id)
  if (todo.length) {
    report.warnings.push(`domains.json: weight is TODO for ${todo.join(', ')}; copy weights from the official exam guide`)
  } else {
    const sum = domains.data.reduce((total, d) => total + (d.weight as number), 0)
    if (sum !== 100) report.errors.push(`domains.json: weights sum to ${sum}, expected 100`)
  }

  const seenIds = new Set<string>()
  for (const [file, json] of Object.entries(questionFiles)) {
    const fileDomain = file.replace(/\.json$/, '')
    if (!domainIds.includes(fileDomain)) report.errors.push(`questions/${file}: no domain "${fileDomain}" in domains.json`)
    if (!Array.isArray(json)) {
      report.errors.push(`questions/${file}: must be an array of questions`)
      continue
    }
    json.forEach((raw, i) => {
      const q = QuestionSchema.safeParse(raw)
      if (!q.success) {
        report.errors.push(...format(`questions/${file}[${i}]`, q.error))
        return
      }
      if (q.data.domain !== fileDomain) report.errors.push(`${q.data.id}: domain "${q.data.domain}" does not match file ${file}`)
      if (seenIds.has(q.data.id)) report.errors.push(`${q.data.id}: duplicate question id`)
      seenIds.add(q.data.id)
    })
  }
  return report
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contentDir = fileURLToPath(new URL('../content', import.meta.url))
  const questionsDir = join(contentDir, 'questions')
  const questionFiles: Record<string, unknown> = {}
  if (existsSync(questionsDir)) {
    for (const file of readdirSync(questionsDir).filter((f) => f.endsWith('.json'))) {
      questionFiles[file] = readJson(join(questionsDir, file))
    }
  }

  const { errors, warnings } = checkContent(readJson(join(contentDir, 'domains.json')), questionFiles)
  for (const w of warnings) console.warn(`warning: ${w}`)
  for (const e of errors) console.error(`error: ${e}`)
  console.log(`${Object.keys(questionFiles).length} question file(s) checked: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(errors.length ? 1 : 0)
}
