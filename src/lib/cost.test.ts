import { describe, expect, it } from 'vitest'
import { DEFAULT_WORKLOAD, estimateCost, savings } from './cost'
import { testModel } from '../test/fixtures'
describe('independent cost examples', () => {
  it('rejects numeric overflow rather than showing an infinite bill', () => {
    expect(
      estimateCost(
        { ...testModel, pricing: { ...testModel.pricing, input: 1e305 } },
        DEFAULT_WORKLOAD,
      ).reason,
    ).toBe('numericOverflow')
  })
  it('1000 users × 5 calls × 30 days at $2/$8 per million = $900/month', () => {
    const cost = estimateCost(testModel, DEFAULT_WORKLOAD)
    expect(cost.perCall).toBeCloseTo(0.006, 12)
    expect(cost.dailyCalls).toBe(5000)
    expect(cost.monthlyCalls).toBe(150000)
    expect(cost.daily).toBeCloseTo(30)
    expect(cost.monthly).toBeCloseTo(900)
    expect(cost.annual).toBeCloseTo(10800)
  })
  it('50% cache at $0.50/M gives $787.50/month', () =>
    expect(estimateCost(testModel, { ...DEFAULT_WORKLOAD, cache: 0.5 }).monthly).toBeCloseTo(787.5))
  it('unknown cache price grants no discount and warns', () => {
    const cost = estimateCost(
      { ...testModel, pricing: { ...testModel.pricing, cacheRead: null } },
      { ...DEFAULT_WORKLOAD, cache: 1 },
    )
    expect(cost.monthly).toBeCloseTo(900)
    expect(cost.warnings).toContain('cacheUnknown')
  })
  it('includes a known per-request fee', () =>
    expect(
      estimateCost(
        { ...testModel, pricing: { ...testModel.pricing, request: 0.001 } },
        DEFAULT_WORKLOAD,
      ).monthly,
    ).toBeCloseTo(1050))
  it('free tokens stay exactly zero and warn about limits', () => {
    const cost = estimateCost(
      { ...testModel, pricing: { input: 0, output: 0, cacheRead: null, request: 0 } },
      DEFAULT_WORKLOAD,
    )
    expect(cost.monthly).toBe(0)
    expect(cost.warnings).toContain('freeLimits')
  })
  it('unknown price is not zero, even for zero traffic', () =>
    expect(
      estimateCost(
        { ...testModel, pricing: { ...testModel.pricing, output: null } },
        { ...DEFAULT_WORKLOAD, users: 0 },
      ).monthly,
    ).toBeNull())
  it('zero known-price traffic costs zero', () =>
    expect(estimateCost(testModel, { ...DEFAULT_WORKLOAD, users: 0 }).monthly).toBe(0))
  it('rejects non-text output rather than applying token math', () =>
    expect(
      estimateCost({ ...testModel, outputModalities: ['image'] }, DEFAULT_WORKLOAD).reason,
    ).toBe('nonText'))
  it('rejects context overflow', () =>
    expect(estimateCost(testModel, { ...DEFAULT_WORKLOAD, input: 128000 }).reason).toBe(
      'contextExceeded',
    ))
  it('rejects output limit overflow', () =>
    expect(estimateCost(testModel, { ...DEFAULT_WORKLOAD, output: 20000 }).reason).toBe(
      'outputExceeded',
    ))
  it.each([
    { users: -1 },
    { calls: 0.5 },
    { input: NaN },
    { days: 32 },
    { days: 0 },
    { cache: 1.01 },
    { users: Infinity },
  ])('rejects invalid workload %j', (patch) =>
    expect(estimateCost(testModel, { ...DEFAULT_WORKLOAD, ...patch }).reason).toBe(
      'invalidWorkload',
    ),
  )
  it('handles savings from zero or missing baselines', () => {
    expect(savings(0, 0)).toEqual({ amount: 0, percent: null })
    expect(savings(null, 5)).toBeNull()
    expect(savings(100, 25)).toEqual({ amount: 75, percent: 75 })
  })
})
