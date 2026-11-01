import { z } from 'zod'
import type { Model, Workload } from '../types/model'
export const workloadSchema = z.object({
  users: z.number().int().min(0).max(1e8),
  calls: z.number().int().min(0).max(1e6),
  input: z.number().int().min(0).max(1e8),
  output: z.number().int().min(0).max(1e8),
  days: z.number().int().min(1).max(31),
  cache: z.number().min(0).max(1),
})
export const DEFAULT_WORKLOAD: Workload = {
  users: 1000,
  calls: 5,
  input: 1000,
  output: 500,
  days: 30,
  cache: 0,
}
export type CostWarning =
  'cacheUnknown' | 'requestUnknown' | 'extraFees' | 'contextUnknown' | 'freeLimits'
export type CostUnavailable =
  | 'invalidWorkload'
  | 'nonText'
  | 'missingPrice'
  | 'contextExceeded'
  | 'outputExceeded'
  | 'numericOverflow'
export interface Estimate {
  perCall: number | null
  dailyCalls: number
  monthlyCalls: number
  daily: number | null
  monthly: number | null
  annual: number | null
  warnings: CostWarning[]
  reason?: CostUnavailable
}
/** Annual = 12 identical modeled months. All prices are USD/token. */
export function estimateCost(model: Model, workload: Workload): Estimate {
  const valid = workloadSchema.safeParse(workload)
  const dailyCalls = valid.success ? workload.users * workload.calls : 0
  const monthlyCalls = valid.success ? dailyCalls * workload.days : 0
  const unavailable = (reason: CostUnavailable): Estimate => ({
    perCall: null,
    dailyCalls,
    monthlyCalls,
    daily: null,
    monthly: null,
    annual: null,
    warnings: [],
    reason,
  })
  if (!valid.success) return unavailable('invalidWorkload')
  if (!model.inputModalities.includes('text') || !model.outputModalities.includes('text'))
    return unavailable('nonText')
  if (model.pricing.input === null || model.pricing.output === null)
    return unavailable('missingPrice')
  if (model.context !== null && workload.input + workload.output > model.context)
    return unavailable('contextExceeded')
  if (model.maxOutput !== null && workload.output > model.maxOutput)
    return unavailable('outputExceeded')
  const warnings: CostWarning[] = []
  if (workload.cache > 0 && model.pricing.cacheRead === null) warnings.push('cacheUnknown')
  if (model.pricing.request === null) warnings.push('requestUnknown')
  if (model.context === null) warnings.push('contextUnknown')
  if (model.extraPricing.length) warnings.push('extraFees')
  if (isFree(model)) warnings.push('freeLimits')
  const cachedRate = model.pricing.cacheRead ?? model.pricing.input
  const input =
    workload.input * ((1 - workload.cache) * model.pricing.input + workload.cache * cachedRate)
  const perCall = input + workload.output * model.pricing.output + (model.pricing.request ?? 0)
  const hasBilledUsage =
    (workload.input > 0 &&
      ((workload.cache < 1 && model.pricing.input > 0) ||
        (workload.cache > 0 && cachedRate > 0))) ||
    (workload.output > 0 && model.pricing.output > 0) ||
    (model.pricing.request ?? 0) > 0
  const daily = perCall * dailyCalls
  const monthly = daily * workload.days
  if (
    (perCall === 0 && hasBilledUsage) ||
    ![perCall, daily, monthly, monthly * 12].every(Number.isFinite)
  )
    return unavailable('numericOverflow')
  return { perCall, dailyCalls, monthlyCalls, daily, monthly, annual: monthly * 12, warnings }
}
/** Free text pricing is not a claim about tools, quota, or availability. */
export function isFree(model: Model) {
  return (
    model.inputModalities.includes('text') &&
    model.outputModalities.includes('text') &&
    model.pricing.input === 0 &&
    model.pricing.output === 0 &&
    (model.pricing.request ?? 0) === 0
  )
}
export function savings(baseline: number | null, alternative: number | null) {
  if (baseline === null || alternative === null) return null
  const amount = baseline - alternative
  const percent = baseline > 0 ? (amount / baseline) * 100 : null
  return { amount, percent: percent !== null && Number.isFinite(percent) ? percent : null }
}
