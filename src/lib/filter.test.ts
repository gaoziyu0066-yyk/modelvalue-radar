import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, filterModels, paginate, scenarioMatch } from './filter'
import { DEFAULT_WORKLOAD } from './cost'
import { testModel } from '../test/fixtures'
const free = {
  ...testModel,
  id: 'test/free',
  pricing: { ...testModel.pricing, input: 0, output: 0 },
}
const unknown = { ...testModel, id: 'test/unknown', pricing: { ...testModel.pricing, input: null } }
describe('filters and deterministic ranking', () => {
  it.each(['input', 'output', 'newest', 'context'] as const)(
    'sorts %s with missing metadata last and stable ID ties',
    (sort) => {
      const missing = {
        ...unknown,
        created: null,
        context: null,
        pricing: { ...unknown.pricing, output: null },
      }
      const b = { ...testModel, id: 'test/beta' }
      const input = [missing, b, testModel]
      expect(
        filterModels(input, { ...DEFAULT_FILTERS, sort }, DEFAULT_WORKLOAD).map((m) => m.id),
      ).toEqual(['test/alpha', 'test/beta', 'test/unknown'])
      expect(input.map((m) => m.id)).toEqual(['test/unknown', 'test/beta', 'test/alpha'])
    },
  )
  it('applies output price and provider filters including explicit zero', () => {
    expect(
      filterModels(
        [free, testModel],
        { ...DEFAULT_FILTERS, provider: 'test', maxOutput: 0 },
        DEFAULT_WORKLOAD,
      ),
    ).toEqual([free])
    expect(
      filterModels([testModel], { ...DEFAULT_FILTERS, provider: 'absent' }, DEFAULT_WORKLOAD),
    ).toEqual([])
  })
  it('does not rank a price as a usable workload when context is exceeded', () => {
    const tiny = { ...free, context: 100 }
    expect(
      filterModels([tiny, testModel], { ...DEFAULT_FILTERS, budget: 1000 }, DEFAULT_WORKLOAD),
    ).toEqual([testModel])
  })
  it('does not label non-text output as a free text model', () => {
    expect(
      filterModels(
        [{ ...free, outputModalities: ['image'] }],
        { ...DEFAULT_FILTERS, free: true },
        DEFAULT_WORKLOAD,
      ),
    ).toEqual([])
  })
  it('ranks free, known-price, unknown in that order', () =>
    expect(
      filterModels([unknown, testModel, free], DEFAULT_FILTERS, DEFAULT_WORKLOAD).map((m) => m.id),
    ).toEqual(['test/free', 'test/alpha', 'test/unknown']))
  it('never matches unknown prices to a zero budget', () =>
    expect(
      filterModels([unknown, testModel, free], { ...DEFAULT_FILTERS, budget: 0 }, DEFAULT_WORKLOAD),
    ).toEqual([free]))
  it('filters free models', () =>
    expect(
      filterModels([unknown, free], { ...DEFAULT_FILTERS, free: true }, DEFAULT_WORKLOAD),
    ).toEqual([free]))
  it('searches name and ID case-insensitively', () =>
    expect(
      filterModels([testModel], { ...DEFAULT_FILTERS, query: ' ALPHA ' }, DEFAULT_WORKLOAD),
    ).toHaveLength(1))
  it('combines hard constraints', () =>
    expect(
      filterModels(
        [testModel],
        { ...DEFAULT_FILTERS, modality: 'image', parameter: 'tools', minContext: 200000 },
        DEFAULT_WORKLOAD,
      ),
    ).toHaveLength(0))
  it('uses only declared parameters for coding', () => {
    expect(scenarioMatch(testModel, 'code')).toBe(true)
    expect(scenarioMatch({ ...testModel, parameters: [] }, 'code')).toBe(false)
  })
  it('requires text output for vision', () =>
    expect(scenarioMatch({ ...testModel, outputModalities: ['image'] }, 'vision')).toBe(false))
  it('context weight can change preference order', () => {
    const large = { ...testModel, id: 'test/large', context: 1000000 }
    expect(
      filterModels(
        [free, large],
        { ...DEFAULT_FILTERS, sort: 'match', costWeight: 0 },
        DEFAULT_WORKLOAD,
      )[0]?.id,
    ).toBe('test/large')
    expect(
      filterModels(
        [free, large],
        { ...DEFAULT_FILTERS, sort: 'match', costWeight: 100 },
        DEFAULT_WORKLOAD,
      )[0]?.id,
    ).toBe('test/free')
  })
  it('clamps pagination after a filter changes', () => {
    expect(paginate([1, 2], 99)).toMatchObject({ page: 1, pages: 1, items: [1, 2] })
    expect(paginate([], -2).page).toBe(1)
  })
})
