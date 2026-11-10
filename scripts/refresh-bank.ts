// Publishes reviewed draft questions into the bank when the schedule is due. Run by the refresh workflow.
// Set FORCE=true to run outside the scheduled hour. Nothing is published from drafts that are not reviewed.
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeReviewed, RefreshStatusSchema, type Bank } from '../src/lib/refresh.ts'
import { isRefreshDue, ScheduleSchema } from '../src/lib/schedule.ts'
import { BankSchema, QuestionSchema, type Question } from '../src/lib/schema.ts'

const content = fileURLToPath(new URL('../content/', import.meta.url))
const readJson = (path: string) => JSON.parse(readFileSync(join(content, path), 'utf8'))
const writeJson = (path: string, data: unknown) => writeFileSync(join(content, path), JSON.stringify(data, null, 2) + '\n')

function readDrafts(): Question[] {
  const dir = join(content, 'drafts')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => QuestionSchema.array().parse(JSON.parse(readFileSync(join(dir, file), 'utf8'))))
}

function report(changed: boolean, summary: string) {
  console.log(summary)
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\nsummary=${summary}\n`)
}

function main() {
  const now = new Date()
  const schedule = ScheduleSchema.parse(readJson('schedule.json'))
  if (process.env.FORCE !== 'true' && !isRefreshDue(schedule, now)) return report(false, 'not due')

  const bank = BankSchema.parse(readJson('bank/questions.json')) as Bank
  const result = mergeReviewed(bank, readDrafts(), now.toISOString().slice(0, 10))
  if (result.added.length === 0) return report(false, 'no new reviewed questions')

  writeJson('bank/questions.json', result.bank)
  const runUrl = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null
  writeJson('refresh-status.json', RefreshStatusSchema.parse({ lastPublishedAt: now.toISOString(), runUrl }))
  report(true, `bank v${result.bank.version}: ${result.added.join(', ')}`)
}

main()
