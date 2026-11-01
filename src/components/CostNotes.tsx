import type { Estimate } from '../lib/cost'
import { useLocale } from '../hooks/useLocale'
import { useCostLabels } from '../hooks/useCostLabels'
export function CostNotes({ estimate }: { estimate: Estimate }) {
  const labels = useCostLabels()
  return (
    <div className="cost-notes">
      {estimate.reason && (
        <p role="status" className="notice">
          {labels[estimate.reason]}
        </p>
      )}
      {estimate.warnings.map((w) => (
        <p key={w}>• {labels[w]}</p>
      ))}
    </div>
  )
}
export function EstimateDisclaimer() {
  const { t } = useLocale()
  return (
    <p className="fine-print">
      {t(
        'USD estimates for text-token usage, not a bill. Provider routing, tiered/long-context rates, cache writes, reasoning-token usage, images/audio/video, tools, taxes and platform fees may change the total. Annual = 12 modeled months.',
        '美元文本 Token 费用估算，不等于实际账单。路由、阶梯及长上下文费率、缓存写入、推理 Token 用量、图像/音频/视频、工具、税费及平台费可能改变总额。年度 = 12 个设定月份。',
      )}
    </p>
  )
}
