import { useLocale } from '../hooks/useLocale'
import type { Workload } from '../types/model'
import { DEFAULT_WORKLOAD } from '../lib/cost'
import { Button } from './ui/button'
export function WorkloadForm({
  value,
  onChange,
}: {
  value: Workload
  onChange: (value: Workload) => void
}) {
  const { t } = useLocale()
  const fields: {
    key: Exclude<keyof Workload, 'cache'>
    name: string
    hint: string
    min: number
    max: number
  }[] = [
    {
      key: 'users',
      name: t('Daily active users', '每日活跃用户'),
      hint: t('People using your app each day', '每天使用应用的人数'),
      min: 0,
      max: 1e8,
    },
    {
      key: 'calls',
      name: t('Calls / user / day', '每用户每天调用次数'),
      hint: t('Average requests per person', '每个人的平均请求次数'),
      min: 0,
      max: 1e6,
    },
    {
      key: 'input',
      name: t('Input tokens / call', '每次输入 Token'),
      hint: t('Include system prompt and history', '包含系统提示词与历史记录'),
      min: 0,
      max: 1e8,
    },
    {
      key: 'output',
      name: t('Output tokens / call', '每次输出 Token'),
      hint: t('Include billed reasoning tokens', '包含计费的推理 Token'),
      min: 0,
      max: 1e8,
    },
    {
      key: 'days',
      name: t('Days / month', '每月计算天数'),
      hint: t('1–31 active days', '1–31 个活跃日'),
      min: 1,
      max: 31,
    },
  ]
  return (
    <div className="workload-form">
      <div className="section-heading">
        <h3>{t('Your workload', '你的工作负载')}</h3>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_WORKLOAD)}>
          {t('Reset', '重置')}
        </Button>
      </div>
      {fields.map(({ key, name, hint, min, max }) => (
        <label className="field" key={key}>
          <span>{name}</span>
          <input
            type="number"
            min={min}
            max={max}
            step="1"
            aria-invalid={!Number.isInteger(value[key]) || value[key] < min || value[key] > max}
            value={Number.isNaN(value[key]) ? '' : value[key]}
            onChange={(e) =>
              onChange({ ...value, [key]: e.target.value === '' ? NaN : Number(e.target.value) })
            }
          />
          <small>{hint}</small>
        </label>
      ))}
      <label className="field">
        <span>
          {t('Input cache hit rate', '输入缓存命中率')}
          <strong>{Math.round(value.cache * 100)}%</strong>
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={value.cache * 100}
          onChange={(e) => onChange({ ...value, cache: Number(e.target.value) / 100 })}
        />
        <small>
          {t('Discount only when a cache-read price is known.', '仅在已知缓存读取价格时计算折扣。')}
        </small>
      </label>
    </div>
  )
}
