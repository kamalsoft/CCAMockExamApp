declare module 'virtual:content' {
  import type { Domain, Question } from './lib/schema.ts'
  const content: { domains: Domain[]; questions: Question[] }
  export default content
}
