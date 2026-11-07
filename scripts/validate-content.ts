import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { BankSchema, DomainsSchema, QuestionSchema } from '../src/lib/schema.ts'
import { parseWalkthrough } from '../src/lib/walkthrough.ts'

type Report = { errors: string[]; warnings: string[] }
// Markdown keyed by walkthrough id (walkthroughs/<id>.md) and by domain id (labs/<domain>/README.md).
export type Docs = { walkthroughs: Record<string, string>; labs: Record<string, string> }

const format = (where: string, error: z.ZodError) =>
  error.issues.map((i) => `${where}${i.path.length ? `.${i.path.join('.')}` : ''}: ${i.message}`)

// bankJson is content/bank/questions.json, parsed.
export function checkContent(
  domainsJson: unknown,
  bankJson: unknown,
  docs: Docs = { walkthroughs: {}, labs: {} },
): Report {
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
  const conceptUses: Record<string, Record<string, string[]>> = {} // domain -> concept -> question ids
  const bank = BankSchema.omit({ questions: true }).extend({ questions: z.array(z.unknown()) }).safeParse(bankJson)
  if (!bank.success) report.errors.push(...format('bank/questions.json', bank.error))
  const entries = bank.success ? bank.data.questions : []
  entries.forEach((raw, i) => {
    const q = QuestionSchema.safeParse(raw)
    if (!q.success) {
      report.errors.push(...format(`bank/questions.json[${i}]`, q.error))
      return
    }
    if (!domainIds.includes(q.data.domain)) report.errors.push(`${q.data.id}: no domain "${q.data.domain}" in domains.json`)
    if (seenIds.has(q.data.id)) report.errors.push(`${q.data.id}: duplicate question id`)
    seenIds.add(q.data.id)
    for (const c of q.data.concepts) ((conceptUses[q.data.domain] ??= {})[c] ??= []).push(q.data.id)
  })

  for (const d of domains.data) {
    if (d.labId && !docs.labs[d.id]) report.errors.push(`domains.json: ${d.id} has labId but no content/labs/${d.id}/README.md`)
    if (!d.walkthroughId) continue
    const markdown = docs.walkthroughs[d.walkthroughId]
    if (!markdown) {
      report.errors.push(`domains.json: ${d.id} has no content/walkthroughs/${d.walkthroughId}.md`)
      continue
    }
    // Every concept a question tests must link to a walkthrough section that explains it.
    const covered = new Set(parseWalkthrough(markdown).sections.flatMap((s) => s.concepts))
    for (const [concept, ids] of Object.entries(conceptUses[d.id] ?? {})) {
      if (!covered.has(concept)) {
        report.errors.push(`walkthroughs/${d.walkthroughId}.md: no section lists concept "${concept}" (used by ${ids.join(', ')})`)
      }
    }
  }
  return report
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export const defaultContentDir = fileURLToPath(new URL('../content', import.meta.url))

export function readContent(contentDir: string) {
  const bankFile = join(contentDir, 'bank', 'questions.json')
  const bankJson = existsSync(bankFile) ? readJson(bankFile) : undefined
  const docs: Docs = { walkthroughs: {}, labs: {} }
  const walkthroughsDir = join(contentDir, 'walkthroughs')
  if (existsSync(walkthroughsDir)) {
    for (const file of readdirSync(walkthroughsDir).filter((f) => f.endsWith('.md'))) {
      docs.walkthroughs[file.replace(/\.md$/, '')] = readFileSync(join(walkthroughsDir, file), 'utf8')
    }
  }
  const labsDir = join(contentDir, 'labs')
  if (existsSync(labsDir)) {
    for (const domainId of readdirSync(labsDir)) {
      const readme = join(labsDir, domainId, 'README.md')
      if (existsSync(readme)) docs.labs[domainId] = readFileSync(readme, 'utf8')
    }
  }
  return { domainsJson: readJson(join(contentDir, 'domains.json')), bankJson, docs }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { domainsJson, bankJson, docs } = readContent(defaultContentDir)
  const { errors, warnings } = checkContent(domainsJson, bankJson, docs)
  for (const w of warnings) console.warn(`warning: ${w}`)
  for (const e of errors) console.error(`error: ${e}`)
  console.log(`content checked: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(errors.length ? 1 : 0)
}
