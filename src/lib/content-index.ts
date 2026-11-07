import type { Domain, Question } from './schema.ts'

export type WalkthroughPage = {
  domainId: string
  title: string
  introHtml: string
  sections: { anchor: string; title: string; concepts: string[]; html: string }[]
}
export type LabPage = { domainId: string; labId: string; html: string }

// What the build step serves to the app as `virtual:content`.
export type ContentIndex = {
  domains: Domain[]
  questions: Question[]
  walkthroughs: WalkthroughPage[]
  labs: LabPage[]
}
