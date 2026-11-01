import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const compact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
export const money = (value: number | null, digits = 2) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value)
export const tokenPrice = (value: number | null) =>
  value === null ? '—' : money(value * 1e6, value > 0 && value * 1e6 < 0.01 ? 4 : 2)
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
