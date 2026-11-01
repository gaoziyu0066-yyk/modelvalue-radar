import { createContext, useContext } from 'react'
import type { Locale } from '../types/model'
export const LocaleContext = createContext<Locale>('en')
export function useLocale() {
  const locale = useContext(LocaleContext)
  return { locale, t: (en: string, zh: string) => (locale === 'zh' ? zh : en) }
}
