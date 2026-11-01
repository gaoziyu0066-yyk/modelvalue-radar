import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Layers,
  MessageCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react'
import type { Model, Page, Workload } from '../types/model'
import {
  DEFAULT_FILTERS,
  filterModels,
  paginate,
  type Filters,
  type Scenario,
  type Sort,
} from '../lib/filter'
import { estimateCost, isFree } from '../lib/cost'
import { compact, money, tokenPrice } from '../lib/utils'
import { useLocale } from '../hooks/useLocale'
import { Button } from '../components/ui/button'
import { ModelIdentity } from '../components/ModelIdentity'
import { EmptyCatalog, Skeleton } from '../components/Status'
import { useCostLabels } from '../hooks/useCostLabels'

interface Props {
  models: Model[]
  workload: Workload
  selected: string[]
  toggle: (id: string) => void
  navigate: (page: Page) => void
  details: (model: Model) => void
  loading: boolean
}
export default function Explore({
  models,
  workload,
  selected,
  toggle,
  navigate,
  details,
  loading,
}: Props) {
  const { t } = useLocale()
  const labels = useCostLabels()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [advanced, setAdvanced] = useState(false)
  const change = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(1)
  }
  const filtered = useMemo(
    () => filterModels(models, filters, workload),
    [models, filters, workload],
  )
  const result = paginate(filtered, page)
  const providers = useMemo(() => [...new Set(models.map((m) => m.provider))].sort(), [models])
  const scenarios = [
    { id: 'code', icon: Braces, label: t('Coding', '编写代码') },
    { id: 'chat', icon: MessageCircle, label: t('Everyday chat', '日常聊天') },
    { id: 'documents', icon: FileText, label: t('Long documents', '长文档') },
    { id: 'batch', icon: Layers, label: t('Batch processing', '批量处理') },
    { id: 'vision', icon: Image, label: t('Image understanding', '图像理解') },
    { id: 'budget', icon: Wallet, label: t('Budget first', '预算优先') },
  ] as const
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="tiny-orbit" />
            {t('LESS GUESSWORK. BETTER DECISIONS.', '少一点猜测，多一点依据。')}
          </div>
          <h1>
            {t('The right model.', '选对模型。')}
            <br />
            <span>{t('The right price.', '用对预算。')}</span>
          </h1>
          <p>
            {t(
              'Find the best AI model for your budget. Explore transparent pricing, compare your options, and know what your next idea will cost.',
              '找到适合你预算的 AI 模型。查看透明价格，对比候选方案，算清下一个创意的成本。',
            )}
          </p>
          <div className="hero-actions">
            <Button
              onClick={() =>
                document.getElementById('model-explorer')?.scrollIntoView({
                  behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                })
              }
            >
              {t('Explore models', '探索模型')}
              <ArrowRight size={16} />
            </Button>
            <Button variant="outline" onClick={() => navigate('calculator')}>
              {t('Calculate my costs', '计算我的成本')}
            </Button>
          </div>
          <div className="hero-trust">
            <span>
              <Check size={13} />
              {t('Open source', '开源免费')}
            </span>
            <span>
              <Check size={13} />
              {t('No sign-up', '无需注册')}
            </span>
            <span>
              <Check size={13} />
              {t('Transparent math', '透明公式')}
            </span>
          </div>
        </div>
        <div className="radar-art" aria-hidden="true">
          <div className="radar-grid" />
          <div className="radar-ring r1" />
          <div className="radar-ring r2" />
          <div className="radar-ring r3" />
          <div className="radar-beam" />
          <div className="radar-center">
            <span>mv</span>
            <small>RADAR</small>
          </div>
          <span className="radar-point p1" />
          <span className="radar-point p2" />
          <span className="radar-point p3" />
          <div className="radar-label label-a">
            <span className="green-dot" />
            {t('Your budget, in focus', '聚焦你的预算')}
          </div>
          <div className="radar-label label-b">
            <Braces size={16} />
            {t('Built for your workload', '匹配实际工作负载')}
          </div>
          <div className="radar-coordinate">PRICE × CONTEXT × YOUR NEEDS</div>
        </div>
      </section>
      <section className="stats-strip" aria-label={t('Catalog summary', '目录概览')}>
        <div>
          <span>{t('Models in this session', '当前会话模型')}</span>
          <strong>
            {models.length ? models.length.toLocaleString() : '—'}
            <small>{t('to explore', '可供探索')}</small>
          </strong>
        </div>
        <div>
          <span>{t('Model authors', '模型提供商')}</span>
          <strong>
            {providers.length || '—'}
            <small>{t('one workspace', '统一对比')}</small>
          </strong>
        </div>
        <div>
          <span>{t('Free text-token options', '免费文本 Token 选项')}</span>
          <strong>
            {models.length ? models.filter(isFree).length : '—'}
            <small>{t('limits may apply', '可能受用量限制')}</small>
          </strong>
        </div>
        <div>
          <span>{t('Your monthly workload', '你的每月工作负载')}</span>
          <strong>
            {Number.isFinite(workload.users * workload.calls * workload.days)
              ? compact(workload.users * workload.calls * workload.days)
              : '—'}
            <small>{t('API calls', '次 API 调用')}</small>
          </strong>
        </div>
      </section>
      <section id="model-explorer" className="explorer">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{t('THE MODEL EXPLORER', '模型发现')}</div>
            <h2>{t('Meet your next model', '发现你的下一个模型')}</h2>
            <p className="muted">
              {t('A shortlist built on facts. A choice made by you.', '用事实筛选，由你作出选择。')}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('methodology')}>
            {t('How we compare', '了解比较方法')}
            <ArrowRight size={14} />
          </Button>
        </div>
        <div className="scenario-row">
          {scenarios.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`scenario-chip ${filters.scenario === id ? 'active' : ''}`}
              aria-pressed={filters.scenario === id}
              onClick={() =>
                change({ scenario: filters.scenario === id ? 'all' : (id as Scenario) })
              }
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        {filters.scenario !== 'all' && (
          <p className="scenario-explanation">
            {t('Matching candidates, not a quality ranking.', '符合条件的候选模型，并非质量排名。')}{' '}
            {
              {
                code: t(
                  'Requires text input/output and tool calling.',
                  '要求文本输入输出与工具调用。',
                ),
                chat: t('Requires text input/output.', '要求文本输入输出。'),
                documents: t(
                  'Requires text input/output and ≥128K context.',
                  '要求文本输入输出与至少 128K 上下文。',
                ),
                batch: t(
                  'Requires text and structured outputs / response format; does not imply a batch API discount.',
                  '要求文本及结构化输出或响应格式，不代表支持批处理折扣。',
                ),
                vision: t(
                  'Requires image input and text output; image costs are excluded.',
                  '要求图像输入与文本输出，图像费用不在估算内。',
                ),
                budget: t('Requires known text-token prices.', '要求已知文本 Token 价格。'),
              }[filters.scenario]
            }
          </p>
        )}
        <div className="panel catalog-panel">
          <div className="filter-bar">
            <label className="search-field">
              <Search size={17} />
              <input
                aria-label={t('Search models', '搜索模型')}
                placeholder={t('Search models or providers…', '搜索模型或提供商…')}
                value={filters.query}
                onChange={(e) => change({ query: e.target.value })}
              />
              {filters.query && (
                <button
                  onClick={() => change({ query: '' })}
                  aria-label={t('Clear search', '清空搜索')}
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <select
              aria-label={t('Provider', '提供商')}
              value={filters.provider}
              onChange={(e) => change({ provider: e.target.value })}
            >
              <option value="">{t('All providers', '全部提供商')}</option>
              {providers.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <Button
              variant={advanced ? 'secondary' : 'outline'}
              onClick={() => setAdvanced(!advanced)}
              aria-expanded={advanced}
            >
              <SlidersHorizontal size={15} />
              {t('Filters', '筛选')}
            </Button>
          </div>
          {advanced && (
            <div className="advanced-filters">
              <label className="field">
                <span>{t('Input modality', '输入模态')}</span>
                <select
                  value={filters.modality}
                  onChange={(e) => change({ modality: e.target.value })}
                >
                  <option value="">{t('Any modality', '任意模态')}</option>
                  {['text', 'image', 'audio', 'video', 'file'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t('API parameter', 'API 参数')}</span>
                <select
                  value={filters.parameter}
                  onChange={(e) => change({ parameter: e.target.value })}
                >
                  <option value="">{t('Any parameter', '任意参数')}</option>
                  {[
                    'tools',
                    'structured_outputs',
                    'response_format',
                    'reasoning',
                    'temperature',
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t('Minimum context', '最小上下文')}</span>
                <select
                  value={filters.minContext}
                  onChange={(e) => change({ minContext: Number(e.target.value) })}
                >
                  {[0, 32000, 128000, 200000, 1000000].map((x) => (
                    <option value={x} key={x}>
                      {x ? compact(x) : t('Any context', '任意上下文')}
                    </option>
                  ))}
                </select>
              </label>
              {(
                [
                  { key: 'maxInput', label: t('Max input $ / 1M', '最高输入价 $ / 百万') },
                  { key: 'maxOutput', label: t('Max output $ / 1M', '最高输出价 $ / 百万') },
                  { key: 'budget', label: t('Monthly budget ($)', '月度预算（美元）') },
                ] as const
              ).map(({ key, label }) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('No limit', '不限')}
                    value={filters[key] ?? ''}
                    onChange={(e) =>
                      change({
                        [key]: e.target.value === '' ? null : Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>
              ))}
              <label className="field weight-field">
                <span>
                  {t('Preference weighting', '偏好权重')}: {filters.costWeight}% {t('cost', '成本')}{' '}
                  / {100 - filters.costWeight}% {t('context', '上下文')}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.costWeight}
                  onChange={(e) => change({ costWeight: Number(e.target.value), sort: 'match' })}
                />
                <small>
                  {t(
                    'Ranks normalized cost and context among current candidates. Not an ability score.',
                    '按当前候选模型的归一化成本与上下文排序，不是能力分数。',
                  )}
                </small>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.free}
                  onChange={(e) => change({ free: e.target.checked })}
                />
                {t('Free text-token pricing only', '仅免费文本 Token')}
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS)
                  setPage(1)
                }}
              >
                {t('Reset filters', '重置筛选')}
              </Button>
            </div>
          )}
          <div className="ranking-bar">
            <div className="ranking-tabs">
              {[
                { label: t('Workload cost', '工作负载成本'), sort: 'cost' },
                { label: t('Lowest input price', '最低输入价'), sort: 'input' },
                { label: t('Newest listed', '最新上架'), sort: 'newest' },
                { label: t('Long context', '长上下文'), sort: 'context' },
              ].map(({ label, sort }) => (
                <button
                  key={sort}
                  className={filters.sort === sort ? 'active' : ''}
                  onClick={() => change({ sort: sort as Sort })}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              aria-label={t('Sort models', '模型排序')}
              value={filters.sort}
              onChange={(e) => change({ sort: e.target.value as Sort })}
            >
              {[
                ['cost', t('Monthly cost ↑', '月度成本 ↑')],
                ['input', t('Input price ↑', '输入价格 ↑')],
                ['output', t('Output price ↑', '输出价格 ↑')],
                ['newest', t('Newest listed', '最新上架')],
                ['context', t('Context ↓', '上下文 ↓')],
                ['match', t('My preferences', '我的偏好')],
              ].map(([v, l]) => (
                <option value={v} key={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="table-note">
            <span>
              {filtered.length} {t('matching models', '个符合条件的模型')}{' '}
              <span className="muted">
                · {t('Prices per 1M tokens (USD)', '每百万 Token 价格（美元）')}
              </span>
            </span>
            <button className="text-link" onClick={() => navigate('calculator')}>
              {t('Edit workload', '编辑工作负载')}
              <ArrowRight size={12} />
            </button>
          </div>
          {loading && !models.length ? (
            <Skeleton />
          ) : !models.length ? (
            <EmptyCatalog />
          ) : !filtered.length ? (
            <div className="empty">
              <Search size={28} />
              <h3>{t('No models match these filters', '没有符合筛选条件的模型')}</h3>
              <p>
                {t(
                  'Try a broader budget, context window or search term.',
                  '尝试放宽预算、上下文要求或搜索关键词。',
                )}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS)
                  setPage(1)
                }}
              >
                {t('Clear all filters', '清除全部筛选')}
              </Button>
            </div>
          ) : (
            <>
              <div className="table-scroll">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th className="rank-col">#</th>
                      <th>{t('Model', '模型')}</th>
                      <th>{t('Context', '上下文')}</th>
                      <th>
                        {t('Input', '输入')}
                        <small>$/1M</small>
                      </th>
                      <th>
                        {t('Output', '输出')}
                        <small>$/1M</small>
                      </th>
                      <th>{t('Capabilities', '支持特性')}</th>
                      <th className="cost-col">{t('Est. / month', '估算 / 月')}</th>
                      <th>
                        <span className="sr-only">{t('Compare', '对比')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((m, i) => {
                      const estimate = estimateCost(m, workload)
                      const checked = selected.includes(m.id)
                      return (
                        <tr key={m.id} className={checked ? 'selected-row' : ''}>
                          <td className="rank-col">{(result.page - 1) * 10 + i + 1}</td>
                          <td>
                            <button className="model-name-button" onClick={() => details(m)}>
                              <ModelIdentity model={m} />
                            </button>
                          </td>
                          <td data-label={t('Context', '上下文')} className="mono">
                            {m.context ? compact(m.context) : '—'}
                          </td>
                          <td data-label={t('Input / 1M', '输入 / 百万')} className="mono">
                            {tokenPrice(m.pricing.input)}
                          </td>
                          <td data-label={t('Output / 1M', '输出 / 百万')} className="mono">
                            {tokenPrice(m.pricing.output)}
                          </td>
                          <td>
                            <div className="tag-list">
                              {m.inputModalities.includes('image') && (
                                <span className="tag">{t('Vision', '视觉')}</span>
                              )}
                              {m.parameters.includes('tools') && (
                                <span className="tag">{t('Tools', '工具')}</span>
                              )}
                              {isFree(m) && (
                                <span className="tag free">{t('Free tokens', '免费 Token')}</span>
                              )}
                              {!m.parameters.includes('tools') &&
                                !m.inputModalities.includes('image') &&
                                !isFree(m) && (
                                  <span className="tag">
                                    {m.outputModalities.join(', ') || '—'}
                                  </span>
                                )}
                            </div>
                          </td>
                          <td
                            data-label={t('Est. monthly cost', '月度成本估算')}
                            className="mono cost-col"
                            title={estimate.reason ? labels[estimate.reason] : undefined}
                          >
                            {money(estimate.monthly)}
                            {estimate.reason && <small>{t('Not estimated', '无法估算')}</small>}
                          </td>
                          <td>
                            <Button
                              variant={checked ? 'secondary' : 'outline'}
                              size="icon"
                              className="compare-add"
                              disabled={!checked && selected.length >= 3}
                              onClick={() => toggle(m.id)}
                              aria-label={`${checked ? t('Remove', '移除') : t('Compare', '对比')} ${m.name}`}
                              aria-pressed={checked}
                            >
                              {checked ? <Check size={15} /> : <Plus size={15} />}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <span>
                  {t('Showing', '显示')} {(result.page - 1) * 10 + 1}–
                  {Math.min(result.page * 10, result.total)} {t('of', '/')} {result.total}
                </span>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={result.page <= 1}
                    onClick={() => setPage(result.page - 1)}
                    aria-label={t('Previous page', '上一页')}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span>
                    {result.page} / {result.pages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={result.page >= result.pages}
                    onClick={() => setPage(result.page + 1)}
                    aria-label={t('Next page', '下一页')}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <p className="fine-print explorer-footnote">
          {t(
            'Price rankings are not capability rankings. “Newest” uses catalog creation time, not release or price-change time. Open a model for parameters and its source.',
            '价格排名不代表能力排名。“最新”采用目录创建时间，并非模型发布或价格变动时间。点击模型可查看参数及来源。',
          )}
        </p>
      </section>
      <section className="bottom-cta">
        <div className="cta-icon">
          <Wallet size={25} />
        </div>
        <div>
          <h3>
            {t('A small price difference. A big monthly impact.', '单价差一点，月费差很多。')}
          </h3>
          <p>
            {t(
              'Put your actual usage into the calculator and see the difference.',
              '把实际用量放进计算器，让成本差异一目了然。',
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('calculator')}>
          {t('Run the numbers', '算一算')}
          <ArrowRight size={15} />
        </Button>
      </section>
    </>
  )
}
