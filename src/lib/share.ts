import { z } from 'zod'
import { DEFAULT_WORKLOAD, workloadSchema } from './cost'
import type { Page, Workload } from '../types/model'
const stateSchema = z.object({
  v: z.literal(1),
  models: z.array(z.string().min(1).max(200)).max(3),
  workload: workloadSchema,
})
export interface ShareState {
  models: string[]
  workload: Workload
}
export function readShare(search: string, hash = ''): ShareState & { error: boolean } {
  const fragment = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''
  const encoded = new URLSearchParams(fragment).get('s') ?? new URLSearchParams(search).get('s')
  if (!encoded) return { models: [], workload: DEFAULT_WORKLOAD, error: false }
  try {
    if (encoded.length > 4000) throw new Error('Oversized state')
    const parsed = stateSchema.parse(JSON.parse(encoded))
    return { models: [...new Set(parsed.models)], workload: parsed.workload, error: false }
  } catch {
    return { models: [], workload: DEFAULT_WORKLOAD, error: true }
  }
}
export function shareUrl(state: ShareState, href = window.location.href): string {
  const url = new URL(href)
  const value = stateSchema.parse({ v: 1, ...state })
  url.search = ''
  // Fragments stay in the browser instead of reaching hosting access logs.
  url.hash = `compare?${new URLSearchParams({ s: JSON.stringify(value) })}`
  return url.toString()
}
export function readPage(hash: string): Page {
  const page = hash.replace(/^#\/?/, '').split('?')[0] ?? ''
  return ['explore', 'calculator', 'compare', 'insights', 'methodology'].includes(page)
    ? (page as Page)
    : 'explore'
}
