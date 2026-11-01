import { z } from 'zod'
import type { Catalog, Model } from '../types/model'
export const CATALOG_URL = 'https://openrouter.ai/api/v1/models'
export const STALE_MS = 6 * 60 * 60 * 1000
export const rawModelSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(500),
  context_length: z.number().int().positive().nullish(),
  created: z.number().int().nonnegative().max(253402300799).nullish(),
  architecture: z
    .object({
      input_modalities: z.array(z.string()).default([]),
      output_modalities: z.array(z.string()).default([]),
    })
    .nullish(),
  supported_parameters: z.array(z.string()).nullish(),
  top_provider: z
    .object({ max_completion_tokens: z.number().int().positive().nullish() })
    .nullish(),
  pricing: z.record(z.string(), z.unknown()).nullish(),
})
export function parsePrice(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))
    return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}
export function parseCatalog(
  raw: unknown,
  source: Catalog['source'] = 'openrouter',
  fetchedAt = new Date().toISOString(),
): Catalog {
  const envelope = z.object({ data: z.array(z.unknown()).max(10000) }).parse(raw)
  const seen = new Set<string>()
  let rejected = 0
  const models: Model[] = []
  for (const row of envelope.data) {
    const result = rawModelSchema.safeParse(row)
    if (!result.success || seen.has(result.data.id)) {
      rejected++
      continue
    }
    const m = result.data
    seen.add(m.id)
    const p = m.pricing ?? {}
    models.push({
      id: m.id,
      name: m.name,
      provider: m.id.split('/')[0] ?? 'unknown',
      context: m.context_length ?? null,
      maxOutput: m.top_provider?.max_completion_tokens ?? null,
      created: m.created ?? null,
      inputModalities: m.architecture?.input_modalities ?? [],
      outputModalities: m.architecture?.output_modalities ?? [],
      parameters: m.supported_parameters ?? [],
      pricing: {
        input: parsePrice(p.prompt),
        output: parsePrice(p.completion),
        cacheRead: parsePrice(p.input_cache_read),
        request: parsePrice(p.request),
      },
      extraPricing: Object.keys(p).filter(
        (key) =>
          !['prompt', 'completion', 'input_cache_read', 'request'].includes(key) &&
          p[key] != null &&
          parsePrice(p[key]) !== 0,
      ),
      sourceUrl: `https://openrouter.ai/${m.id.split('/').map(encodeURIComponent).join('/')}`,
    })
  }
  if (!models.length) throw new Error('No valid model records. Expected { data: [...] }.')
  return { models, fetchedAt, source, rejected }
}
export interface DataProvider {
  readonly id: string
  load(signal?: AbortSignal): Promise<Catalog>
}
export class CatalogError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs = 60000,
  ) {
    super(message)
  }
}
export const openRouterProvider: DataProvider = {
  id: 'openrouter',
  async load(signal) {
    const response = await fetch(CATALOG_URL, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
        : AbortSignal.timeout(20000),
      credentials: 'omit',
      cache: 'no-store',
    })
    if (!response.ok) {
      const header = response.headers.get('Retry-After')
      const delay = header
        ? /^\d+$/.test(header)
          ? Number(header) * 1000
          : Date.parse(header) - Date.now()
        : 60000
      throw new CatalogError(
        `OpenRouter HTTP ${response.status}. ${response.status === 429 ? 'Rate limit reached.' : 'Catalog unavailable.'}`,
        Number.isFinite(delay) ? Math.max(60000, delay) : 60000,
      )
    }
    return parseCatalog(await response.json())
  },
}
export async function importCatalog(file: File): Promise<Catalog> {
  if (file.size > 10 * 1024 * 1024) throw new Error('Import exceeds 10 MB.')
  return parseCatalog(JSON.parse(await file.text()) as unknown, 'import')
}
