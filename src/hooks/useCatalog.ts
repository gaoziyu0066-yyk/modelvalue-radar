import { useCallback, useEffect, useRef, useState } from 'react'
import { CatalogError, importCatalog, openRouterProvider, STALE_MS } from '../lib/catalog'
import type { Catalog } from '../types/model'
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [retryAt, setRetryAt] = useState(0)
  const busy = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const retry = useRef(0)
  const load = useCallback(async () => {
    if (busy.current || Date.now() < retry.current) return
    busy.current = true
    setLoading(true)
    setError(null)
    controller.current = new AbortController()
    try {
      setCatalog(await openRouterProvider.load(controller.current.signal))
      retry.current = Date.now() + 60000
    } catch (e) {
      if (controller.current.signal.aborted) return
      setError(e instanceof Error ? e.message : 'Unable to load catalog')
      retry.current = Date.now() + (e instanceof CatalogError ? e.retryAfterMs : 60000)
    } finally {
      setLoading(false)
      busy.current = false
      setRetryAt(retry.current)
      setNow(Date.now())
    }
  }, [])
  const importFile = async (file: File) => {
    if (busy.current) return
    setError(null)
    try {
      setCatalog(await importCatalog(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid catalog')
    }
  }
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearInterval(timer)
      controller.current?.abort()
    }
  }, [])
  useEffect(() => {
    if (!catalog || catalog.source !== 'openrouter') return
    const refresh = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - Date.parse(catalog.fetchedAt) >= STALE_MS
      )
        void load()
    }
    const timer = window.setInterval(refresh, 60000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [catalog, load])
  return {
    catalog,
    loading,
    error,
    load,
    importFile,
    stale: Boolean(catalog && now - Date.parse(catalog.fetchedAt) >= STALE_MS),
    cooldown: Math.max(0, Math.ceil((retryAt - now) / 1000)),
  }
}
