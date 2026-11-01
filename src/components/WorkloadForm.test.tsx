import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WorkloadForm } from './WorkloadForm'
import { DEFAULT_WORKLOAD } from '../lib/cost'
import { LocaleContext } from '../hooks/useLocale'
describe('workload controls', () => {
  it('sends invalid blank input to validation instead of silently turning it into zero', () => {
    const change = vi.fn()
    render(<WorkloadForm value={DEFAULT_WORKLOAD} onChange={change} />)
    fireEvent.change(screen.getByRole('spinbutton', { name: /Daily active users/ }), {
      target: { value: '' },
    })
    expect(change).toHaveBeenCalledWith({ ...DEFAULT_WORKLOAD, users: NaN })
  })
  it('supports localized accessible labels and converts cache percentage to ratio', () => {
    const change = vi.fn()
    render(
      <LocaleContext.Provider value="zh">
        <WorkloadForm value={DEFAULT_WORKLOAD} onChange={change} />
      </LocaleContext.Provider>,
    )
    fireEvent.change(screen.getByRole('slider', { name: /输入缓存命中率/ }), {
      target: { value: '75' },
    })
    expect(change).toHaveBeenCalledWith({ ...DEFAULT_WORKLOAD, cache: 0.75 })
    fireEvent.click(screen.getByRole('button', { name: '重置' }))
    expect(change).toHaveBeenLastCalledWith(DEFAULT_WORKLOAD)
  })
})
