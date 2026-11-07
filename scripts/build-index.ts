import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { DomainsSchema, QuestionSchema, type Domain, type Question } from '../src/lib/schema.ts'
import { checkContent, defaultContentDir, readContent } from './validate-content.ts'

export type ContentIndex = { domains: Domain[]; questions: Question[] }

// Validates all content and returns only reviewed questions, so drafts never reach the app.
export function buildIndex(contentDir = defaultContentDir): ContentIndex {
  const { domainsJson, questionFiles } = readContent(contentDir)
  const { errors } = checkContent(domainsJson, questionFiles)
  if (errors.length) throw new Error(`Content is invalid:\n${errors.join('\n')}`)

  const questions = Object.values(questionFiles)
    .flatMap((file) => QuestionSchema.array().parse(file))
    .filter((q) => q.review_status === 'reviewed')
  return { domains: DomainsSchema.parse(domainsJson), questions }
}

const virtualId = 'virtual:content'
const resolvedId = '\0' + virtualId

// Serves the index as `import content from 'virtual:content'`.
export function contentPlugin(contentDir = defaultContentDir): Plugin {
  return {
    name: 'cca-content',
    resolveId: (id) => (id === virtualId ? resolvedId : undefined),
    load(id) {
      if (id !== resolvedId) return
      // Watch each content file (not the directory, which Vite would try to resolve as an import).
      const questionsDir = join(contentDir, 'questions')
      this.addWatchFile(join(contentDir, 'domains.json'))
      if (existsSync(questionsDir)) {
        for (const file of readdirSync(questionsDir)) this.addWatchFile(join(questionsDir, file))
      }
      return `export default ${JSON.stringify(buildIndex(contentDir))}`
    },
  }
}
