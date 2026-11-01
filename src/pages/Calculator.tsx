import { useState } from 'react'
import { ArrowRight, Calculator as CalculatorIcon } from 'lucide-react'
import type { Model, Page, Workload } from '../types/model'
import { estimateCost, savings, workloadSchema } from '../lib/cost'
import { money, compact } from '../lib/utils'
import { useLocale } from '../hooks/useLocale'
import { WorkloadForm } from '../components/WorkloadForm'
import { CostNotes, EstimateDisclaimer } from '../components/CostNotes'
import { EmptyCatalog } from '../components/Status'
import { ModelIdentity } from '../components/ModelIdentity'
import { Button } from '../components/ui/button'
interface Props {
  models: Model[]
  workload: Workload
  setWorkload: (w: Workload) => void
  selected: string[]
  navigate: (p: Page) => void
  compareWith: (ids: string[]) => void
}
export default function Calculator({
  models,
  workload,
  setWorkload,
  selected,
  navigate,
  compareWith,
}: Props) {
  const { t } = useLocale()
  const [modelId, setModelId] = useState(selected[0] ?? '')
  const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name))
  const model =
    models.find((m) => m.id === modelId) ??
    models.find((m) => selected.includes(m.id)) ??
    sorted.find(
      (m) =>
        m.inputModalities.includes('text') &&
        m.outputModalities.includes('text') &&
        m.pricing.input !== null &&
        m.pricing.output !== null,
    ) ??
    sorted[0]
  const estimate = model ? estimateCost(model, workload) : null
  const alternatives = model
    ? models
        .filter(
          (m) =>
            m.id !== model.id &&
            m.inputModalities.includes('text') &&
            m.outputModalities.includes('text'),
        )
        .map((m) => ({ model: m, cost: estimateCost(m, workload).monthly }))
        .filter(
          (m): m is { model: Model; cost: number } =>
            m.cost !== null && estimate?.monthly != null && m.cost < estimate.monthly,
        )
        .sort((a, b) => a.cost - b.cost || a.model.id.localeCompare(b.model.id))
        .slice(0, 3)
    : []
  return (
    <section className="page-section">
      <div className="page-intro">
        <div className="eyebrow">{t('PLAN BEFORE YOU BUILD', '先算清，再构建')}</div>
        <h1>{t('An idea. A workload. A number.', '一个创意，一份用量，一笔明账。')}</h1>
        <p>
          {t(
            'Turn tokens into a budget you can work with. Every assumption is visible.',
            '把 Token 转化为可规划的预算，每个假设都清晰可见。',
          )}
        </p>
      </div>
      <div className="calculator-layout">
        <div className="panel">
          <WorkloadForm value={workload} onChange={setWorkload} />
        </div>
        <div className="calculator-results">
          {!workloadSchema.safeParse(workload).success && (
            <p className="notice error" role="alert">
              {t(
                'Use non-negative whole numbers within the field limits, 1–31 days, and a cache rate of 0–100%.',
                '请在字段范围内输入非负整数，天数为 1–31，缓存比例为 0–100%。',
              )}
            </p>
          )}
          {!model || !estimate ? (
            <div className="panel">
              <EmptyCatalog />
            </div>
          ) : (
            <>
              <div className="panel estimate-panel">
                <div className="section-heading">
                  <h2>
                    <CalculatorIcon size={18} />
                    {t('Your estimate', '费用估算')}
                  </h2>
                  <span className="tag">USD</span>
                </div>
                <label className="field">
                  <span>{t('Calculate for model', '选择计算模型')}</span>
                  <select value={model.id} onChange={(e) => setModelId(e.target.value)}>
                    {sorted.map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="monthly-estimate">
                  <span>{t('Estimated monthly cost', '预估月度费用')}</span>
                  <strong
                    data-testid="monthly-cost"
                    className={money(estimate.monthly).length > 14 ? 'long-amount' : undefined}
                  >
                    {money(estimate.monthly)}
                  </strong>
                  <small>
                    {compact(estimate.monthlyCalls)} {t('calls over', '次调用 /')} {workload.days}{' '}
                    {t('days', '天')}
                  </small>
                </div>
                <div className="cost-grid">
                  {[
                    [t('Per call', '单次调用'), money(estimate.perCall, 6)],
                    [t('Daily cost', '每日费用'), money(estimate.daily)],
                    [t('Annual cost', '年度费用'), money(estimate.annual)],
                    [t('Daily calls', '每日调用'), estimate.dailyCalls.toLocaleString()],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{val}</strong>
                    </div>
                  ))}
                </div>
                <CostNotes estimate={estimate} />
                <EstimateDisclaimer />
              </div>
              <div className="panel alternatives">
                <div className="section-heading">
                  <div>
                    <h3>{t('Lower-cost candidates', '更低成本的候选模型')}</h3>
                    <p className="muted">
                      {t(
                        'Same workload. Different capabilities may apply.',
                        '同一工作负载，能力与特性可能不同。',
                      )}
                    </p>
                  </div>
                </div>
                {alternatives.length ? (
                  alternatives.map(({ model: candidate, cost }) => {
                    const saving = savings(estimate.monthly, cost)
                    return (
                      <div className="alternative" key={candidate.id}>
                        <ModelIdentity model={candidate} small />
                        <div className="alternative-price">
                          <strong>
                            {money(cost)}
                            <small>/{t('mo', '月')}</small>
                          </strong>
                          <span>
                            {t('Save', '可节省')} {money(saving?.amount ?? null)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`${t('Compare', '对比')} ${candidate.name}`}
                          onClick={() => compareWith([model.id, candidate.id])}
                        >
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <p className="muted">
                    {t(
                      'No lower-cost estimable candidates for this workload in the loaded catalog.',
                      '已加载目录中没有适用于此用量的更低成本候选模型。',
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="panel formula-panel">
        <div>
          <span className="eyebrow">{t('NO BLACK BOX', '计算过程公开')}</span>
          <h2>{t('The math behind your estimate', '估算背后的数学公式')}</h2>
          <p className="muted">
            {t(
              'Rates below are USD per token. The catalog displays them per million.',
              '以下费率单位为美元 / Token；目录页面显示为美元 / 百万 Token。',
            )}
          </p>
        </div>
        <div className="formula">
          <code>C = I × ((1 − h) × Pᵢ + h × P꜀) + O × Pₒ + R</code>
          <code>{t('Monthly', '月度')} = C × U × N × D</code>
          <p>
            {t(
              'I / O = input / output tokens · h = cache hit ratio · Pᵢ / Pₒ = token rates · P꜀ = cache-read rate (or Pᵢ if unknown) · R = known per-request fee (otherwise 0) · U = daily users · N = calls per user · D = days.',
              'I / O = 输入 / 输出 Token；h = 缓存命中率；Pᵢ / Pₒ = Token 单价；P꜀ = 缓存读取价（未知时用 Pᵢ）；R = 已知单次请求费（否则为 0）；U = 日用户数；N = 每用户调用次数；D = 天数。',
            )}
          </p>
          <button className="text-link" onClick={() => navigate('methodology')}>
            {t('Read all assumptions', '查看完整假设')}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </section>
  )
}
