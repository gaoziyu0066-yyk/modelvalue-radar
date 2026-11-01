import { useState } from 'react'
import type { Model, Workload } from '../types/model'
import { useLocale } from '../hooks/useLocale'
import { PriceScatter, CostChart } from '../components/Charts'
import { tokenPrice, money } from '../lib/utils'
import { estimateCost } from '../lib/cost'
import { paginate } from '../lib/filter'
import { Button } from '../components/ui/button'
import { EmptyCatalog } from '../components/Status'
import { CostNotes, EstimateDisclaimer } from '../components/CostNotes'
export default function Insights({
  models,
  workload,
  selected,
}: {
  models: Model[]
  workload: Workload
  selected: string[]
}) {
  const { t } = useLocale()
  const [max, setMax] = useState('10')
  const [page, setPage] = useState(1)
  const usable = models.filter(
    (m) =>
      m.pricing.input !== null &&
      m.pricing.output !== null &&
      (max === '' || m.pricing.input * 1e6 <= Number(max)),
  )
  const table = paginate(usable, page, 15)
  const chosen = selected.flatMap((id) => {
    const m = models.find((x) => x.id === id)
    return m ? [m] : []
  })
  return (
    <section className="page-section">
      <div className="page-intro">
        <div className="eyebrow">{t('SEE THE PRICE LANDSCAPE', '看清价格分布')}</div>
        <h1>{t('A little perspective goes a long way.', '换个视角，看清差异。')}</h1>
        <p>
          {t(
            'Explore the relationship between input and output pricing. Lower left means lower token prices, not better quality.',
            '探索输入与输出价格的关系。左下角代表更低 Token 价格，不代表更高质量。',
          )}
        </p>
      </div>
      {!models.length ? (
        <div className="panel">
          <EmptyCatalog />
        </div>
      ) : (
        <>
          <div className="panel chart-panel">
            <div className="section-heading">
              <div>
                <h2>{t('The pricing landscape', '模型价格分布')}</h2>
                <p className="muted">
                  {usable.length}{' '}
                  {t(
                    'models with known prices · linear axes · hover for details',
                    '个已知价格模型 · 线性坐标轴 · 悬停查看详情',
                  )}
                </p>
              </div>
              <label className="field compact-field">
                <span>{t('Max input $ / 1M', '最高输入价 $ / 百万')}</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={max}
                  placeholder={t('No limit', '不限')}
                  onChange={(e) => {
                    setMax(e.target.value === '' ? '' : String(Math.max(0, Number(e.target.value))))
                    setPage(1)
                  }}
                />
              </label>
            </div>
            {usable.length ? (
              <PriceScatter models={usable} />
            ) : (
              <div className="empty">
                {t('No known prices in this range.', '此价格范围内没有已知价格模型。')}
              </div>
            )}
          </div>
          <div className="panel chart-panel">
            <h3>{t('Monthly cost of your shortlist', '你的候选模型月度成本')}</h3>
            {chosen.length ? (
              <>
                <CostChart models={chosen} workload={workload} />
                <div
                  className="shortlist-data"
                  aria-label={t('Shortlist monthly estimates', '候选模型月度估算')}
                >
                  {chosen.map((m) => {
                    const cost = estimateCost(m, workload)
                    return (
                      <div key={m.id}>
                        <strong>{m.name}</strong>
                        <p>{money(cost.monthly)}</p>
                        <CostNotes estimate={cost} />
                      </div>
                    )
                  })}
                </div>
                <EstimateDisclaimer />
              </>
            ) : (
              <p className="muted">
                {t(
                  'Select up to three models in Explore to see this chart.',
                  '在发现页选择最多三个模型，即可显示此图表。',
                )}{' '}
                <a href="#explore">{t('Explore models', '探索模型')} →</a>
              </p>
            )}
          </div>
          <details className="panel data-table-details">
            <summary>
              {t('Accessible chart data', '图表数据表')} · {usable.length} {t('models', '个模型')}
            </summary>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label={t('Scrollable chart data', '可滚动图表数据')}
            >
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>{t('Model', '模型')}</th>
                    <th>{t('Input $ / 1M', '输入 $ / 百万')}</th>
                    <th>{t('Output $ / 1M', '输出 $ / 百万')}</th>
                    <th>{t('Monthly estimate', '月度估算')}</th>
                  </tr>
                </thead>
                <tbody>
                  {table.items.map((m) => (
                    <tr key={m.id}>
                      <th scope="row">{m.name}</th>
                      <td>{tokenPrice(m.pricing.input)}</td>
                      <td>{tokenPrice(m.pricing.output)}</td>
                      <td>{money(estimateCost(m, workload).monthly)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                {table.page}/{table.pages}
              </span>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={table.page === 1}
                  onClick={() => setPage(table.page - 1)}
                >
                  {t('Previous', '上一页')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={table.page === table.pages}
                  onClick={() => setPage(table.page + 1)}
                >
                  {t('Next', '下一页')}
                </Button>
              </div>
            </div>
          </details>
        </>
      )}
      <div className="notice">
        {t(
          'No historical price chart is shown: this project does not have an authorized, verified history dataset. A catalog retrieval time is not a price-change event.',
          '本项目尚无获授权且可验证的历史数据，因此不展示价格趋势。目录获取时间不代表价格变动事件。',
        )}
      </div>
    </section>
  )
}
