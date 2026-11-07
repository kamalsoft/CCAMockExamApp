import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'
import type { Plugin } from 'vite'
import type { ContentIndex } from '../src/lib/content-index.ts'
import { BankSchema, DomainsSchema } from '../src/lib/schema.ts'
import { parseWalkthrough, sectionAnchor } from '../src/lib/walkthrough.ts'
import { checkContent, defaultContentDir, readContent } from './validate-content.ts'

export type { ContentIndex }

// Headings move down one level: the app's <h1> and page <h2> sit above the Markdown's own headings.
const toHtml = (markdown: string) =>
  marked.parse(markdown, { async: false }).replace(/<(\/?)h([1-5])\b/g, (_, slash, n) => `<${slash}h${Number(n) + 1}`)

// Validates all content and returns only reviewed questions, so drafts never reach the app.
// Walkthroughs and lab READMEs are rendered to HTML here, at build time, from repository files.
export function buildIndex(contentDir = defaultContentDir): ContentIndex {
  const { domainsJson, bankJson, docs } = readContent(contentDir)
  const { errors } = checkContent(domainsJson, bankJson, docs)
  if (errors.length) throw new Error(`Content is invalid:\n${errors.join('\n')}`)

  const domains = DomainsSchema.parse(domainsJson)
  const bank = BankSchema.parse(bankJson)
  const questions = bank.questions.filter((q) => q.review_status === 'reviewed')

  const walkthroughs = domains.flatMap((d) => {
    if (!d.walkthroughId) return []
    const parsed = parseWalkthrough(docs.walkthroughs[d.walkthroughId])
    return [{
      domainId: d.id,
      title: parsed.title,
      introHtml: toHtml(parsed.intro),
      sections: parsed.sections.map((s) => ({
        anchor: sectionAnchor(d.id, s.slug),
        title: s.title,
        concepts: s.concepts,
        html: toHtml(s.body),
      })),
    }]
  })
  const labs = domains.flatMap((d) => (d.labId ? [{ domainId: d.id, labId: d.labId, html: toHtml(docs.labs[d.id]) }] : []))

  return { domains, bank: { version: bank.version, published_at: bank.published_at }, questions, walkthroughs, labs }
}

// Every file the index is built from, so the dev server reloads when any of them changes.
// Only existing paths: Vite fails the whole module on a missing one, such as a stray .DS_Store "lab".
export function contentFiles(contentDir: string): string[] {
  const list = (dir: string) => (existsSync(dir) ? readdirSync(dir).map((f) => join(dir, f)) : [])
  return [
    join(contentDir, 'domains.json'),
    ...list(join(contentDir, 'bank')),
    ...list(join(contentDir, 'walkthroughs')),
    ...list(join(contentDir, 'labs')).map((dir) => join(dir, 'README.md')),
  ].filter((file) => existsSync(file))
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
      // Watch each file (not the directories, which Vite would try to resolve as imports).
      for (const file of contentFiles(contentDir)) this.addWatchFile(file)
      return `export default ${JSON.stringify(buildIndex(contentDir))}`
    },
  }
}
