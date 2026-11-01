import { useState } from 'react'
import { Copy, Link, Plus, X } from 'lucide-react'
import type { Model, Workload } from '../types/model'
import { useLocale } from '../hooks/useLocale'
import { estimateCost, savings, workloadSchema } from '../lib/cost'
import { shareUrl } from '../lib/share'
import { compact, money, tokenPrice } from '../lib/utils'
import { ModelIdentity } from '../components/ModelIdentity'
import { Button } from '../components/ui/button'
import { CostChart } from '../components/Charts'
import { CostNotes, EstimateDisclaimer } from '../components/CostNotes'
interface Props {
  models: Model[]
  selected: string[]
  setSelected: (ids: string[]) => void
  workload: Workload
  fetchedAt?: string
}
export default function Compare({ models, selected, setSelected, workload, fetchedAt }: Props) {
  const { t } = useLocale()
  const chosen = selected.flatMap((id) => {
    const model = models.find((m) => m.id === id)
    return model ? [model] : []
  })
  const missing = selected.filter((id) => !models.some((m) => m.id === id))
  const [copyStatus, setCopyStatus] = useState('')
  const [manualCopy, setManualCopy] = useState('')
  const costs = chosen.map((m) => estimateCost(m, workload))
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyStatus(t('Copied to clipboard', '已复制到剪贴板'))
      setManualCopy('')
    } catch {
      setManualCopy(value)
      setCopyStatus(
        t(
          'Clipboard unavailable. Select and copy the text below.',
          '剪贴板不可用，请手动选择并复制下方文本。',
        ),
      )
    }
  }
  const resultText = () =>
    [
      'ModelValue Radar — text-token estimate (USD)',
      `Retrieved: ${fetchedAt ?? 'unknown'}; not a price-change timestamp.`,
      `Workload: ${JSON.stringify(workload)}`,
      ...chosen.map(
        (m, i) =>
          `${m.name} | input ${tokenPrice(m.pricing.input)}/1M | output ${tokenPrice(m.pricing.output)}/1M | monthly ${money(costs[i]?.monthly ?? null)} | ${m.sourceUrl}`,
      ),
      'Excludes tiers, cache writes, media, tools, taxes and platform fees. See model-specific warnings in the app.',
      shareUrl({ models: selected, workload }),
    ].join('\n')
  const validWorkload = workloadSchema.safeParse(workload).success
  const rows: { label: string; value: (m: Model, i: number) => React.ReactNode }[] = [
    {
      label: t('Input / 1M tokens', '输入 / 百万 Token'),
      value: (m) => tokenPrice(m.pricing.input),
    },
    {
      label: t('Output / 1M tokens', '输出 / 百万 Token'),
      value: (m) => tokenPrice(m.pricing.output),
    },
    {
      label: t('Cache read / 1M', '缓存读取 / 百万'),
      value: (m) => tokenPrice(m.pricing.cacheRead),
    },
    {
      label: t('Context window', '上下文窗口'),
      value: (m) => (m.context ? compact(m.context) : '—'),
    },
    {
      label: t('Maximum output', '最大输出'),
      value: (m) => (m.maxOutput ? compact(m.maxOutput) : '—'),
    },
    {
      label: t('Input → output', '输入 → 输出'),
      value: (m) =>
        `${m.inputModalities.join(', ') || '—'} → ${m.outputModalities.join(', ') || '—'}`,
    },
    {
      label: t('Tool calling', '工具调用'),
      value: (m) =>
        m.parameters.includes('tools')
          ? t('Supported', '已声明支持')
          : t('Not advertised', '未声明'),
    },
    {
      label: t('Structured output', '结构化输出'),
      value: (m) =>
        m.parameters.includes('structured_outputs') || m.parameters.includes('response_format')
          ? t('Supported', '已声明支持')
          : t('Not advertised', '未声明'),
    },
    {
      label: t('Reasoning parameter', '推理参数'),
      value: (m) =>
        m.parameters.some((p) => ['reasoning', 'reasoning_effort', 'include_reasoning'].includes(p))
          ? t('Supported', '已声明支持')
          : t('Not advertised', '未声明'),
    },
    {
      label: t('Monthly estimate', '月度估算'),
      value: (_m, i) => <strong className="accent-text">{money(costs[i]?.monthly ?? null)}</strong>,
    },
    {
      label: t('Savings vs. first model', '相对首个模型节省'),
      value: (_m, i) => {
        const saving = savings(costs[0]?.monthly ?? null, costs[i]?.monthly ?? null)
        return i === 0
          ? t('Baseline', '基准')
          : saving
            ? `${money(saving.amount)}${saving.percent === null ? '' : ` (${saving.percent.toFixed(1)}%)`}`
            : '—'
      },
    },
    {
      label: t('Data source', '数据来源'),
      value: (m) => (
        <a href={m.sourceUrl} target="_blank" rel="noreferrer">
          OpenRouter ↗
        </a>
      ),
    },
  ]
  return (
    <section className="page-section">
      <div className="page-intro page-intro-row">
        <div>
          <div className="eyebrow">{t('SIDE BY SIDE, WITHOUT THE HYPE', '并排比较，回归事实')}</div>
          <h1>{t('Make the trade-offs clear.', '让取舍清晰可见。')}</h1>
          <p>
            {t(
              'Up to three models. One workload. A comparison you can share.',
              '最多三个模型，同一份工作负载，一份可以分享的比较。',
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!chosen.length || !validWorkload}
            onClick={() => void copy(resultText())}
          >
            <Copy size={15} />
            {t('Copy results', '复制结果')}
          </Button>
          <Button
            disabled={!selected.length || !validWorkload}
            onClick={() => void copy(shareUrl({ models: selected, workload }))}
          >
            <Link size={15} />
            {t('Share comparison', '分享对比')}
          </Button>
        </div>
      </div>
      {copyStatus && (
        <p role="status" className="notice">
          {copyStatus}
        </p>
      )}
      {manualCopy && (
        <textarea
          className="manual-copy"
          aria-label={t('Copy manually', '手动复制')}
          readOnly
          value={manualCopy}
          onFocus={(e) => e.target.select()}
        />
      )}
      {!!missing.length && (
        <div className="notice">
          {t(
            'These shared models are not in the loaded catalog. Load the source or remove them:',
            '以下分享模型不在当前目录中，请加载来源或移除：',
          )}{' '}
          {missing.map((id) => (
            <Button
              variant="ghost"
              size="sm"
              key={id}
              onClick={() => setSelected(selected.filter((x) => x !== id))}
            >
              {id}
              <X size={12} />
            </Button>
          ))}
        </div>
      )}
      <div className="compare-slots">
        {chosen.map((m) => (
          <div className="panel compare-slot" key={m.id}>
            <ModelIdentity model={m} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelected(selected.filter((id) => id !== m.id))}
              aria-label={`${t('Remove', '移除')} ${m.name}`}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 3 - selected.length) }, (_, i) => (
          <div className="compare-slot empty-slot" key={`empty-${i}`}>
            <Plus size={18} />
            <label className="sr-only" htmlFor={`add-model-${i}`}>
              {t('Add model', '添加模型')} {i + 1}
            </label>
            <select
              id={`add-model-${i}`}
              value=""
              onChange={(e) => {
                if (e.target.value && selected.length < 3)
                  setSelected([...selected, e.target.value])
              }}
              disabled={!models.length}
            >
              <option value="">{t('Choose a model to compare', '选择要对比的模型')}</option>
              {models
                .filter((m) => !selected.includes(m.id))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((m) => (
                  <option value={m.id} key={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>
      {!chosen.length ? (
        <div className="panel empty">
          <h3>{t('Build your comparison', '开始你的对比')}</h3>
          <p>
            {t(
              'Load a catalog, then choose models here or use the + buttons in the explorer.',
              '加载目录后，在这里选择模型，或使用发现页的 + 按钮。',
            )}
          </p>
        </div>
      ) : (
        <>
          <p className="muted comparison-workload">
            {workload.users.toLocaleString()} {t('users', '用户')} × {workload.calls}{' '}
            {t('calls/day', '次/天')} × {workload.days} {t('days', '天')} ·{' '}
            {workload.input.toLocaleString()} {t('input', '输入')} /{' '}
            {workload.output.toLocaleString()} {t('output tokens', '输出 Token')} ·{' '}
            {Math.round(workload.cache * 100)}% {t('cache', '缓存')}{' '}
            <a href="#calculator">{t('Edit workload', '编辑工作负载')} →</a>
          </p>
          <div className="chart-grid">
            <div className="panel chart-panel">
              <h3>{t('Token prices', 'Token 价格')}</h3>
              <p className="muted">{t('USD per million tokens', '美元 / 百万 Token')}</p>
              <CostChart models={chosen} workload={workload} prices />
            </div>
            <div className="panel chart-panel">
              <h3>{t('Your monthly cost', '你的月度成本')}</h3>
              <p className="muted">
                {t('Same usage, comparable estimates', '相同用量下的可比估算')}
              </p>
              <CostChart models={chosen} workload={workload} />
            </div>
          </div>
          <div className="panel table-scroll">
            <table className="comparison-table">
              <caption className="sr-only">{t('Model comparison details', '模型详细对比')}</caption>
              <thead>
                <tr>
                  <th>{t('At a glance', '一览')}</th>
                  {chosen.map((m) => (
                    <th key={m.id}>{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ label, value }) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {chosen.map((m, i) => (
                      <td key={m.id}>{value(m, i)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">{t('All API parameters', '全部 API 参数')}</th>
                  {chosen.map((m) => (
                    <td key={m.id}>
                      <details>
                        <summary>
                          {m.parameters.length} {t('parameters', '个参数')}
                        </summary>
                        <div className="tag-list">
                          {m.parameters.map((p) => (
                            <span className="tag" key={p}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </details>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('Estimate notes', '估算说明')}</th>
                  {costs.map((cost, i) => (
                    <td key={chosen[i]?.id}>
                      <CostNotes estimate={cost} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <EstimateDisclaimer />
          <p className="fine-print">
            {t(
              'Shared links contain model IDs and workload, not price snapshots. Recipients retrieve their own catalog, so estimates can change. No licensed benchmark dataset is included.',
              '分享链接包含模型 ID 与工作负载，不包含价格快照。接收者加载自己的目录，估算结果可能变化。未纳入未经授权的评测数据。',
            )}
          </p>
        </>
      )}
    </section>
  )
}
