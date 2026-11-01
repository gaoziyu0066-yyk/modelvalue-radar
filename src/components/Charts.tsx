import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { Model, Workload } from '../types/model'
import { estimateCost } from '../lib/cost'
import { useLocale } from '../hooks/useLocale'
import { money } from '../lib/utils'
const tooltipStyle = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: 12,
}
const axis = { stroke: 'var(--muted)', fontSize: 11, tickLine: false, axisLine: false }
export function CostChart({
  models,
  workload,
  prices = false,
}: {
  models: Model[]
  workload: Workload
  prices?: boolean
}) {
  const { t } = useLocale()
  const data = models.map((m) => ({
    name: m.name.replace(/^[^:]+: /, ''),
    input: m.pricing.input === null ? null : m.pricing.input * 1e6,
    output: m.pricing.output === null ? null : m.pricing.output * 1e6,
    monthly: estimateCost(m, workload).monthly,
  }))
  return (
    <div
      className="chart"
      role="img"
      aria-label={
        prices
          ? t(
              'Input and output prices; exact values in comparison table.',
              '输入与输出价格，精确数值见对比表。',
            )
          : t(
              'Estimated monthly costs; exact values in comparison table.',
              '月度成本估算，精确数值见对比表。',
            )
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 12, bottom: 10, left: 0 }}
          accessibilityLayer
        >
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
          <XAxis
            dataKey="name"
            {...axis}
            tickFormatter={(v: string) => (v.length > 20 ? `${v.slice(0, 18)}…` : v)}
            interval={0}
          />
          <YAxis {...axis} tickFormatter={(v: number) => `$${v}`} width={60} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: 'var(--hover)' }}
            formatter={(value) => money(typeof value === 'number' ? value : null, prices ? 4 : 2)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {prices ? (
            <>
              <Bar
                dataKey="input"
                name={t('Input $ / 1M', '输入 $ / 百万')}
                fill="#8d7cfa"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                isAnimationActive={false}
              />
              <Bar
                dataKey="output"
                name={t('Output $ / 1M', '输出 $ / 百万')}
                fill="#5bbfce"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                isAnimationActive={false}
              />
            </>
          ) : (
            <Bar
              dataKey="monthly"
              name={t('Monthly estimate (USD)', '月度估算（美元）')}
              fill="#8d7cfa"
              radius={[5, 5, 0, 0]}
              maxBarSize={80}
              isAnimationActive={false}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
export function PriceScatter({ models }: { models: Model[] }) {
  const { t } = useLocale()
  const data = models
    .filter((m) => m.pricing.input !== null && m.pricing.output !== null)
    .map((m) => ({ name: m.name, x: m.pricing.input! * 1e6, y: m.pricing.output! * 1e6 }))
  return (
    <div
      className="scatter-chart"
      role="img"
      aria-label={t(
        'Input versus output price scatter plot, linear axes; exact values in the table below.',
        '输入与输出价格散点图，线性坐标轴，精确数值见下表。',
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 18, right: 30, bottom: 25, left: 5 }} accessibilityLayer>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis
            type="number"
            dataKey="x"
            name={t('Input $ / 1M', '输入 $ / 百万')}
            {...axis}
            label={{
              value: t('INPUT · USD / 1M TOKENS', '输入 · 美元 / 百万 TOKEN'),
              position: 'bottom',
              fill: 'var(--muted)',
              fontSize: 11,
              dy: 5,
            }}
            domain={[0, 'auto']}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={t('Output $ / 1M', '输出 $ / 百万')}
            {...axis}
            width={65}
            label={{
              value: t('OUTPUT · USD / 1M', '输出 · 美元 / 百万'),
              angle: -90,
              position: 'insideLeft',
              fill: 'var(--muted)',
              fontSize: 10,
            }}
            domain={[0, 'auto']}
          />
          <ZAxis range={[42, 42]} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as
                { name: string; x: number; y: number } | undefined
              return active && point ? (
                <div style={tooltipStyle} className="chart-tooltip">
                  <strong>{point.name}</strong>
                  <p>
                    {t('Input', '输入')}: {money(point.x, 4)}
                  </p>
                  <p>
                    {t('Output', '输出')}: {money(point.y, 4)}
                  </p>
                </div>
              ) : null
            }}
          />
          <Scatter data={data} fill="#9a8aff" fillOpacity={0.75} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
