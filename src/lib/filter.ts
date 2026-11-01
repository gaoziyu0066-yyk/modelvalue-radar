import type { Model, Workload } from '../types/model'
import { estimateCost, isFree } from './cost'
export type Scenario = 'all' | 'code' | 'chat' | 'documents' | 'batch' | 'vision' | 'budget'
export type Sort = 'cost' | 'input' | 'output' | 'newest' | 'context' | 'match'
export interface Filters {
  query: string
  provider: string
  modality: string
  parameter: string
  minContext: number
  maxInput: number | null
  maxOutput: number | null
  budget: number | null
  free: boolean
  scenario: Scenario
  sort: Sort
  costWeight: number
}
export const DEFAULT_FILTERS: Filters = {
  query: '',
  provider: '',
  modality: '',
  parameter: '',
  minContext: 0,
  maxInput: null,
  maxOutput: null,
  budget: null,
  free: false,
  scenario: 'all',
  sort: 'cost',
  costWeight: 80,
}
export function scenarioMatch(model: Model, scenario: Scenario): boolean {
  const text = model.inputModalities.includes('text') && model.outputModalities.includes('text')
  switch (scenario) {
    case 'code':
      return text && model.parameters.includes('tools')
    case 'chat':
      return text
    case 'documents':
      return text && (model.context ?? 0) >= 128000
    case 'batch':
      return (
        text &&
        (model.parameters.includes('structured_outputs') ||
          model.parameters.includes('response_format'))
      )
    case 'vision':
      return model.inputModalities.includes('image') && model.outputModalities.includes('text')
    case 'budget':
      return text && model.pricing.input !== null && model.pricing.output !== null
    default:
      return true
  }
}
export function filterModels(models: Model[], filters: Filters, workload: Workload): Model[] {
  const query = filters.query.trim().toLowerCase()
  const costs = new Map(models.map((m) => [m.id, estimateCost(m, workload).monthly]))
  const selected = models.filter((m) => {
    const cost = costs.get(m.id) ?? null
    return (
      (!query || `${m.name} ${m.id}`.toLowerCase().includes(query)) &&
      (!filters.provider || m.provider === filters.provider) &&
      (!filters.modality || m.inputModalities.includes(filters.modality)) &&
      (!filters.parameter || m.parameters.includes(filters.parameter)) &&
      (!filters.minContext || (m.context !== null && m.context >= filters.minContext)) &&
      (filters.maxInput === null ||
        (m.pricing.input !== null && m.pricing.input * 1e6 <= filters.maxInput)) &&
      (filters.maxOutput === null ||
        (m.pricing.output !== null && m.pricing.output * 1e6 <= filters.maxOutput)) &&
      (filters.budget === null || (cost !== null && cost <= filters.budget)) &&
      (!filters.free || isFree(m)) &&
      scenarioMatch(m, filters.scenario)
    )
  })
  const maxCost = Math.max(1, ...selected.map((m) => costs.get(m.id) ?? 0))
  const maxContext = Math.max(1, ...selected.map((m) => m.context ?? 0))
  const weight = Math.max(0, Math.min(100, filters.costWeight)) / 100
  const score = (m: Model) => {
    const cost = costs.get(m.id)
    return cost == null
      ? -Infinity
      : weight * (1 - cost / maxCost) + (1 - weight) * ((m.context ?? 0) / maxContext)
  }
  const asc = (a: number | null | undefined, b: number | null | undefined) =>
    (a ?? Infinity) - (b ?? Infinity)
  return selected.sort((a, b) => {
    let delta: number
    switch (filters.sort) {
      case 'input':
        delta = asc(a.pricing.input, b.pricing.input)
        break
      case 'output':
        delta = asc(a.pricing.output, b.pricing.output)
        break
      case 'newest':
        delta = (b.created ?? -Infinity) - (a.created ?? -Infinity)
        break
      case 'context':
        delta = (b.context ?? -Infinity) - (a.context ?? -Infinity)
        break
      case 'match':
        delta = score(b) - score(a)
        break
      default:
        delta = asc(costs.get(a.id), costs.get(b.id))
    }
    return (Number.isNaN(delta) ? 0 : delta) || a.id.localeCompare(b.id)
  })
}
export function paginate<T>(items: T[], page: number, size = 10) {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.max(1, Math.min(Math.trunc(page) || 1, pages))
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pages,
    total: items.length,
  }
}
