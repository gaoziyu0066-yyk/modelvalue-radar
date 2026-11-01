export interface Model {
  id: string
  name: string
  provider: string
  context: number | null
  maxOutput: number | null
  created: number | null
  inputModalities: string[]
  outputModalities: string[]
  parameters: string[]
  /** USD per token. Null means unknown/dynamic, never free. */
  pricing: {
    input: number | null
    output: number | null
    cacheRead: number | null
    request: number | null
  }
  extraPricing: string[]
  sourceUrl: string
}
export interface Catalog {
  models: Model[]
  fetchedAt: string
  source: 'openrouter' | 'import'
  rejected: number
}
export interface Workload {
  users: number
  calls: number
  input: number
  output: number
  days: number
  cache: number
}
export type Page = 'explore' | 'calculator' | 'compare' | 'insights' | 'methodology'
export type Locale = 'en' | 'zh'
