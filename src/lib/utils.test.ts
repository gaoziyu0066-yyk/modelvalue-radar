import { describe, expect, it } from 'vitest'
import { money, tokenPrice } from './utils'
describe('price display', () => {
  it('labels huge amounts as approximate without implying cent precision', () => {
    expect(money(3e22)).toBe('≈$3.000e+22')
    expect(money(-1e15)).toBe('≈-$1.000e+15')
  })
  it('preserves small nonzero estimates and savings instead of displaying zero', () => {
    expect(money(0.000001)).toBe('$0.0000010')
    expect(money(-0.000001)).toBe('-$0.0000010')
    expect(money(1e-100)).toBe('$1.00e-100')
    expect(money(0)).toBe('$0.00')
  })
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
