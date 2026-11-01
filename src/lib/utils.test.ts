import { describe, expect, it } from 'vitest'
import { money, tokenPrice } from './utils'
describe('price display', () => {
  it('never rounds a tiny positive token price to a free-looking zero', () => {
    expect(tokenPrice(1e-12)).toBe('$0.0000010')
    expect(tokenPrice(1e-20)).toContain('e-')
    expect(tokenPrice(0)).toBe('$0.00')
    expect(tokenPrice(null)).toBe('—')
  })
  it('does not format unknown/overflow estimates as currency', () => {
    expect(money(null)).toBe('—')
    expect(money(Infinity)).toBe('—')
    expect(tokenPrice(1e308)).toBe('—')
  })
})
