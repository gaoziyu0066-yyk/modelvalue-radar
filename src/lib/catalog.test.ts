import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  parseCatalog,
  parsePrice,
  openRouterProvider,
  CatalogError,
  importCatalog,
} from './catalog'
import { rawTestModel } from '../test/fixtures'
afterEach(() => vi.unstubAllGlobals())
describe('catalog trust boundary', () => {
  it('limits import size before reading the file', async () => {
    const text = vi.fn()
    await expect(
      importCatalog({ size: 10 * 1024 * 1024 + 1, text } as unknown as File),
    ).rejects.toThrow('10 MB')
    expect(text).not.toHaveBeenCalled()
  })
  it('deduplicates declarations and isolates excessive metadata lists', () => {
    const parsed = parseCatalog({
      data: [
        { ...rawTestModel, supported_parameters: ['tools', 'tools'] },
        { ...rawTestModel, id: 'test/excessive', supported_parameters: Array(257).fill('tools') },
      ],
    })
    expect(parsed.models[0]?.parameters).toEqual(['tools'])
    expect(parsed.rejected).toBe(1)
  })
  it('keeps imported HTML as plain text and source URLs on the fixed origin', () => {
    const parsed = parseCatalog(
      {
        data: [{ ...rawTestModel, id: 'evil/<script>?x=#', name: '<img src=x onerror=alert(1)>' }],
      },
      'import',
    )
    expect(parsed.models[0]?.name).toBe('<img src=x onerror=alert(1)>')
    expect(new URL(parsed.models[0]!.sourceUrl).origin).toBe('https://openrouter.ai')
  })
  it('rejects a malformed successful API response and sends neither cookies nor referrer', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', fetcher)
    await expect(openRouterProvider.load()).rejects.toThrow()
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    })
  })
  it('supports date Retry-After and clamps expired dates to the minimum cooldown', async () => {
    const date = new Date(Date.now() + 180000).toUTCString()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response('', { status: 429, headers: { 'Retry-After': date } })),
    )
    await expect(openRouterProvider.load()).rejects.toMatchObject({
      retryAfterMs: expect.any(Number),
    })
    try {
      await openRouterProvider.load()
    } catch (error) {
      expect((error as CatalogError).retryAfterMs).toBeGreaterThan(170000)
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('', {
          status: 503,
          headers: { 'Retry-After': 'Thu, 01 Jan 1970 00:00:00 GMT' },
        }),
      ),
    )
    await expect(openRouterProvider.load()).rejects.toMatchObject({ retryAfterMs: 60000 })
  })
  it.each(['1e-999', '0.0001e-999', '1e308', 1e308])(
    'does not misrepresent unrepresentable prices %s as free or infinite chart values',
    (value) => expect(parsePrice(value)).toBeNull(),
  )
  it('accepts explicit zero with an exponent', () => expect(parsePrice('0e-999')).toBe(0))
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
