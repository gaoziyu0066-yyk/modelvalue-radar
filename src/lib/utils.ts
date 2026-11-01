import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const compact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
export function money(value: number | null, digits = 2) {
  if (value === null || !Number.isFinite(value)) return '—'
  const magnitude = Math.abs(value)
  // Huge estimates cannot promise cent precision in a JavaScript number.
  if (magnitude >= 1e12) return `≈${value < 0 ? '-' : ''}$${magnitude.toExponential(3)}`
  if (magnitude > 0 && magnitude < 1e-8)
    return `${value < 0 ? '-' : ''}$${magnitude.toExponential(2)}`
  const precision =
    magnitude > 0 && magnitude < 10 ** -digits
      ? Math.max(digits, Math.ceil(-Math.log10(magnitude)) + 1)
      : digits
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value)
}
export function tokenPrice(value: number | null) {
  if (value === null) return '—'
  const perMillion = value * 1e6
  if (!Number.isFinite(perMillion)) return '—'
  if (perMillion > 0 && perMillion < 1e-8) return `$${perMillion.toExponential(2)}`
  return money(
    perMillion,
    perMillion > 0 && perMillion < 0.01 ? Math.max(4, Math.ceil(-Math.log10(perMillion)) + 1) : 2,
  )
}
export function safeRead(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}
export function safeWrite(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* Storage may be disabled. */
  }
}
