import { useEffect, useRef } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { Model } from '../types/model'
import { useLocale } from '../hooks/useLocale'
import { ModelIdentity } from './ModelIdentity'
import { Button } from './ui/button'
import { compact, tokenPrice } from '../lib/utils'
export function ModelDetails({ model, close }: { model: Model | null; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useLocale()
  useEffect(() => {
    if (model) ref.current?.showModal()
    else ref.current?.close()
  }, [model])
  return (
    <dialog
      ref={ref}
      className="model-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      aria-labelledby="model-details-title"
    >
      {model && (
        <>
          <div className="section-heading">
            <h2 id="model-details-title">{t('Model details', '模型详情')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label={t('Close details', '关闭详情')}
            >
              <X size={18} />
            </Button>
          </div>
          <ModelIdentity model={model} />
          <code className="model-slug">{model.id}</code>
          <dl className="detail-grid">
            <dt>{t('Input / 1M tokens', '输入 / 百万 Token')}</dt>
            <dd>{tokenPrice(model.pricing.input)}</dd>
            <dt>{t('Output / 1M tokens', '输出 / 百万 Token')}</dt>
            <dd>{tokenPrice(model.pricing.output)}</dd>
            <dt>{t('Cache read / 1M tokens', '缓存读取 / 百万 Token')}</dt>
            <dd>{tokenPrice(model.pricing.cacheRead)}</dd>
            <dt>{t('Context / max output', '上下文 / 最大输出')}</dt>
            <dd>
              {model.context ? compact(model.context) : '—'} /{' '}
              {model.maxOutput ? compact(model.maxOutput) : '—'}
            </dd>
            <dt>{t('Input → output', '输入 → 输出')}</dt>
            <dd>
              {model.inputModalities.join(', ') || '—'} → {model.outputModalities.join(', ') || '—'}
            </dd>
            <dt>{t('Catalog creation date', '目录创建日期')}</dt>
            <dd>
              {model.created !== null
                ? new Date(model.created * 1000).toISOString().slice(0, 10)
                : '—'}
            </dd>
          </dl>
          <h3>{t('Advertised API parameters', '目录声明的 API 参数')}</h3>
          <div className="tag-list">
            {model.parameters.length ? (
              model.parameters.map((p) => (
                <span className="tag" key={p}>
                  {p}
                </span>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
          {!!model.extraPricing.length && (
            <p className="notice">
              {t('Excluded price fields:', '未纳入估算的收费字段：')}{' '}
              {model.extraPricing.join(', ')}
            </p>
          )}
          <p className="fine-print">
            {t(
              'Provider label is the model author inferred from the ID, not a specific inference endpoint. Parameter support can vary by routed provider. Creation date is not the price-change date.',
              '提供商标签根据模型 ID 识别作者，并非实际推理端点。参数支持可能随路由提供商不同而变化。目录创建日期不是价格变动日期。',
            )}
          </p>
          <Button asChild variant="outline">
            <a href={model.sourceUrl} target="_blank" rel="noreferrer">
              OpenRouter <ExternalLink size={14} />
            </a>
          </Button>
        </>
      )}
    </dialog>
  )
}
