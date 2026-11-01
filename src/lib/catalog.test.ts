import { describe, expect, it, vi, afterEach } from 'vitest'
import { parseCatalog, parsePrice, openRouterProvider, CatalogError } from './catalog'
import { rawTestModel } from '../test/fixtures'
afterEach(() => vi.unstubAllGlobals())
describe('catalog trust boundary', () => {
  it.each([null, undefined, '', ' ', '-1', -1, 'Infinity', Infinity, NaN, true, '0x10', {}, 'bad'])(
    'does not convert unknown %j to free',
    (value) => expect(parsePrice(value)).toBeNull(),
  )
  it.each([
    ['0', 0],
    [0, 0],
    ['2e-6', 0.000002],
    ['0.12', 0.12],
  ])('parses %s per-token USD', (input, expected) => expect(parsePrice(input)).toBe(expected))
  it('retains source, units and cache rate', () => {
    const result = parseCatalog({ data: [rawTestModel] }, 'openrouter', '2026-11-01T00:00:00Z')
    expect(result.models[0]?.pricing.input).toBe(0.000002)
    expect(result.models[0]?.sourceUrl).toBe('https://openrouter.ai/test/alpha')
    expect(result.fetchedAt).toBe('2026-11-01T00:00:00Z')
  })
  it('skips bad and duplicate rows but preserves good ones', () => {
    const result = parseCatalog({
      data: [
        rawTestModel,
        {},
        rawTestModel,
        { ...rawTestModel, id: 'test/beta', context_length: -8 },
      ],
    })
    expect(result.models).toHaveLength(1)
    expect(result.rejected).toBe(3)
  })
  it('does not default missing prices or architecture to known values', () => {
    const result = parseCatalog({ data: [{ id: 'test/unknown', name: 'TEST unknown' }] })
    expect(result.models[0]?.pricing.input).toBeNull()
    expect(result.models[0]?.inputModalities).toEqual([])
  })
  it('flags nonzero and unknown additional charges', () => {
    const result = parseCatalog({
      data: [
        {
          ...rawTestModel,
          pricing: { prompt: '0', completion: '0', web_search: '0.01', image: '0', tiered: '-1' },
        },
      ],
    })
    expect(result.models[0]?.extraPricing).toEqual(['web_search', 'tiered'])
  })
  it('preserves models with structured tier overrides and flags excluded fees', () => {
    const result = parseCatalog({
      data: [
        {
          ...rawTestModel,
          pricing: {
            ...rawTestModel.pricing,
            overrides: [{ threshold: 200000, prompt: '0.000004' }],
          },
        },
      ],
    })
    expect(result.models).toHaveLength(1)
    expect(result.models[0]?.extraPricing).toContain('overrides')
    expect(result.models[0]?.pricing.input).toBe(0.000002)
  })
  it.each([null, {}, { data: [] }, { data: [{ wrong: true }] }])(
    'rejects unusable envelope',
    (raw) => expect(() => parseCatalog(raw)).toThrow(),
  )
  it('honors Retry-After without retry storms', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 429, headers: { 'Retry-After': '120' } }))
    vi.stubGlobal('fetch', fetcher)
    await expect(openRouterProvider.load()).rejects.toMatchObject({ retryAfterMs: 120000 })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('reports auth errors without requesting frontend secrets', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })))
    await expect(openRouterProvider.load()).rejects.toBeInstanceOf(CatalogError)
  })
})
