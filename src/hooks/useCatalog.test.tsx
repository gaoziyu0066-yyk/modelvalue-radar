import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCatalog } from './useCatalog'
import { rawTestModel } from '../test/fixtures'
import { STALE_MS } from '../lib/catalog'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('catalog lifecycle', () => {
  it('does not refresh a hidden tab and refreshes stale data when it becomes visible', async () => {
    vi.useFakeTimers()
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [rawTestModel] })))
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(() => useCatalog())
    await act(async () => {
      await result.current.load()
    })
    act(() => vi.advanceTimersByTime(STALE_MS + 60000))
    expect(fetcher).toHaveBeenCalledTimes(1)
    visibility.mockReturnValue('visible')
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(result.current.error).toBeNull()
  })
  it('retains the last good data after malformed refresh and enforces retry cooldown', async () => {
    vi.useFakeTimers()
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [rawTestModel] })))
      .mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(() => useCatalog())
    await act(async () => {
      await result.current.load()
    })
    const good = result.current.catalog
    await act(async () => {
      await result.current.load()
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(60001))
    await act(async () => {
      await result.current.load()
    })
    expect(result.current.catalog).toBe(good)
    expect(result.current.error).toBeTruthy()
    await act(async () => {
      await result.current.load()
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('never automatically replaces an imported file after six hours', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(() => useCatalog())
    await act(async () => {
      await result.current.importFile({
        size: 100,
        text: async () => JSON.stringify({ data: [rawTestModel] }),
      } as File)
    })
    act(() => vi.advanceTimersByTime(STALE_MS + 60000))
    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.catalog?.source).toBe('import')
  })
  it('locks both imports and remote refresh while a local file is being read', async () => {
    let finish!: (text: string) => void
    const file = {
      size: 100,
      text: () =>
        new Promise<string>((resolve) => {
          finish = resolve
        }),
    } as File
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(() => useCatalog())
    let pending!: Promise<void>
    act(() => {
      pending = result.current.importFile(file)
    })
    expect(result.current.loading).toBe(true)
    await act(async () => {
      await result.current.load()
    })
    expect(fetcher).not.toHaveBeenCalled()
    await act(async () => {
      finish(JSON.stringify({ data: [rawTestModel] }))
      await pending
    })
    expect(result.current.catalog?.source).toBe('import')
    expect(result.current.loading).toBe(false)
  })

  it('does not rerender the workspace every second for the status clock', () => {
    vi.useFakeTimers()
    let renders = 0
    renderHook(() => {
      renders++
      return useCatalog()
    })
    const initial = renders
    act(() => vi.advanceTimersByTime(5000))
    expect(renders).toBe(initial)
  })
})
