import { AlertCircle, ArrowUpRight, Database, RefreshCw, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Button } from './ui/button'
import { useLocale } from '../hooks/useLocale'
import type { useCatalog } from '../hooks/useCatalog'
export function CatalogStatus({ data }: { data: ReturnType<typeof useCatalog> }) {
  const { t, locale } = useLocale()
  const input = useRef<HTMLInputElement>(null)
  const { catalog, loading, stale, error, cooldown } = data
  return (
    <section className="catalog-status" aria-label={t('Data status', '数据状态')}>
      <div className="status-line">
        <div className="status-copy">
          <span className={`status-dot ${stale || error ? 'amber' : catalog ? 'green' : ''}`} />
          <span>
            {catalog
              ? catalog.source === 'import'
                ? t('Local import · source age unverified', '本地导入 · 原始数据时效未验证')
                : t('OpenRouter · session catalog', 'OpenRouter · 会话目录')
              : t('Official API. No key required.', '官方 API，无需密钥。')}
          </span>
          {catalog && (
            <span className="muted timestamp">
              {t('Retrieved', '获取于')}{' '}
              {new Date(catalog.fetchedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label={t('Import catalog JSON', '导入目录 JSON')}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void data.importFile(f)
              e.target.value = ''
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => input.current?.click()}
          >
            <Upload size={14} />
            {t('Import JSON', '导入 JSON')}
          </Button>
          <Button
            variant={catalog ? 'outline' : 'default'}
            size="sm"
            disabled={loading || cooldown > 0}
            onClick={() => void data.load()}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading
              ? t('Loading…', '加载中…')
              : cooldown
                ? `${cooldown}s`
                : catalog
                  ? t('Refresh', '刷新')
                  : t('Load official catalog', '加载官方目录')}
          </Button>
        </div>
      </div>
      {!catalog && !loading && (
        <p className="status-note">
          {t(
            'Load directly from OpenRouter into this tab, or import a catalog you have permission to use. Nothing is uploaded or stored on our servers.',
            '直接从 OpenRouter 加载至此标签页，或导入你有权使用的目录。不会上传或保存到本站服务器。',
          )}{' '}
          <a href="https://openrouter.ai/terms" target="_blank" rel="noreferrer">
            {t('Source terms', '来源条款')}
            <ArrowUpRight size={12} />
          </a>
        </p>
      )}
      {stale && (
        <p className="notice" role="status">
          {t(
            'This catalog is over 6 hours old. Prices may be stale.',
            '该目录已超过 6 小时，价格可能过期。',
          )}
        </p>
      )}
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={16} />
          <span>
            {t('Catalog request/import failed. ', '目录请求或导入失败。')}
            {error}{' '}
            {catalog
              ? t(
                  'Keeping the last successful data; treat it as potentially stale.',
                  '保留上次成功数据，请视为可能过期。',
                )
              : t('Retry after the cooldown or import JSON.', '请在冷却结束后重试，或导入 JSON。')}
          </span>
        </div>
      )}
      {!!catalog?.rejected && (
        <p className="notice">
          {catalog.rejected}{' '}
          {t('invalid or duplicate records skipped.', '条无效或重复记录已跳过。')}
        </p>
      )}
    </section>
  )
}
export function EmptyCatalog() {
  const { t } = useLocale()
  return (
    <div className="empty">
      <Database size={30} />
      <h3>{t('Your model shortlist starts here', '从这里开始筛选模型')}</h3>
      <p>
        {t(
          'Load the official catalog above to explore verified API metadata and calculate costs. No fabricated prices, no hidden scores.',
          '加载上方官方目录，探索 API 元数据并计算成本。不虚构价格，不隐藏评分。',
        )}
      </p>
    </div>
  )
}
export function Skeleton() {
  const { t } = useLocale()
  return (
    <div className="skeleton-list" role="status" aria-label={t('Loading models', '正在加载模型')}>
      {Array.from({ length: 6 }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton avatar" />
          <div className="skeleton grow" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ))}
    </div>
  )
}
