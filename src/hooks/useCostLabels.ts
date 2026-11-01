import { useLocale } from './useLocale'
export function useCostLabels() {
  const { t } = useLocale()
  return {
    invalidWorkload: t('Enter a valid workload.', '请输入有效工作负载。'),
    numericOverflow: t(
      'The imported rates exceed the supported calculation range.',
      '导入费率超出可支持的计算范围。',
    ),
    nonText: t(
      'Text-token estimate unavailable for this modality.',
      '此模态无法按文本 Token 估算。',
    ),
    missingPrice: t('Token price is missing or dynamic.', 'Token 价格缺失或为动态价格。'),
    contextExceeded: t(
      'Input + output exceeds the context window.',
      '输入与输出之和超过上下文窗口。',
    ),
    outputExceeded: t('Output exceeds the advertised maximum.', '输出超出已知最大限制。'),
    cacheUnknown: t(
      'Cache-read price missing: cached input is charged at the normal input rate in this estimate.',
      '缺少缓存读取价格：本次估算按普通输入费率计费。',
    ),
    requestUnknown: t(
      'Per-request fee unspecified; assumed zero.',
      '单次请求费用未指定，暂按零计算。',
    ),
    extraFees: t(
      'Additional price fields exist and are excluded.',
      '存在额外收费字段，本估算未包含。',
    ),
    contextUnknown: t(
      'Context limit unknown; check the provider before use.',
      '上下文限制未知，使用前请核实。',
    ),
    freeLimits: t(
      'Free token pricing may have rate limits and availability restrictions.',
      '免费 Token 价格可能受速率与可用性限制。',
    ),
  }
}
