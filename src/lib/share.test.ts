import { describe, expect, it } from 'vitest'
import { readShare, shareUrl } from './share'
import { DEFAULT_WORKLOAD } from './cost'
describe('share links', () => {
  it('round-trips IDs and workload on a Pages subpath without prices', () => {
    const link = new URL(
      shareUrl(
        { models: ['test/a', 'test/b'], workload: DEFAULT_WORKLOAD },
        'https://example.com/modelvalue-radar/',
      ),
    )
    expect(link.pathname).toBe('/modelvalue-radar/')
    expect(link.hash).toBe('#compare')
    expect(readShare(link.search)).toEqual({
      models: ['test/a', 'test/b'],
      workload: DEFAULT_WORKLOAD,
      error: false,
    })
  })
  it('recovers safely from malformed links', () =>
    expect(readShare('?s=broken')).toMatchObject({ error: true, models: [] }))
  it('rejects more than three models and invalid workload', () => {
    expect(() =>
      shareUrl({ models: ['a', 'b', 'c', 'd'], workload: DEFAULT_WORKLOAD }, 'https://example.com'),
    ).toThrow()
    expect(() =>
      shareUrl({ models: [], workload: { ...DEFAULT_WORKLOAD, days: 99 } }, 'https://example.com'),
    ).toThrow()
  })
})
