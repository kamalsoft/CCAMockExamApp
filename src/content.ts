import raw from 'virtual:content'
import type { ContentIndex } from './lib/content-index.ts'

// Built and validated by scripts/build-index.ts, so its shape is known here.
export const content = raw as ContentIndex
