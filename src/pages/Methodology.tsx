import { ArrowUpRight, Code2, Database, Scale, ShieldCheck } from 'lucide-react'
import { useLocale } from '../hooks/useLocale'
export default function Methodology() {
  const { t } = useLocale()
  return (
    <section className="page-section methodology">
      <div className="page-intro">
        <div className="eyebrow">{t('TRUST IS A FEATURE', '可信，本就是功能')}</div>
        <h1>{t('Clear sources. Open assumptions.', '来源清晰，假设公开。')}</h1>
        <p>
          {t(
            'Useful comparisons start with knowing what the data can—and cannot—tell you.',
            '实用的比较，从了解数据能说明什么、不能说明什么开始。',
          )}
        </p>
      </div>
      <div className="method-grid">
        <article className="panel">
          <Database size={23} />
          <h2>{t('Where the data comes from', '数据从哪里来')}</h2>
          <p>
            {t(
              'ModelValue Radar reads the documented OpenRouter models API after you choose to load it. No API key, inference request, or account is used. This is metadata validation, not independent verification of provider claims.',
              '选择加载后，ModelValue Radar 读取 OpenRouter 官方文档化模型 API，无需密钥、推理请求或账号。校验的是元数据格式，并非独立验证提供商的所有声明。',
            )}
          </p>
          <p>
            {t(
              'The provider label comes from the model ID prefix and identifies the author, not necessarily the company serving your request. Advertised parameters and effective prices can vary across routed endpoints.',
              '提供商标签来自模型 ID 前缀，表示作者，并不一定是执行请求的服务商。参数支持和实际价格可能随路由端点而变化。',
            )}
          </p>
          <a
            href="https://openrouter.ai/docs/api/api-reference/models/get-models"
            target="_blank"
            rel="noreferrer"
          >
            {t('Official API documentation', '官方 API 文档')}
            <ArrowUpRight size={14} />
          </a>
        </article>
        <article className="panel">
          <ShieldCheck size={23} />
          <h2>{t('Freshness without false precision', '真实表达数据时效')}</h2>
          <p>
            {t(
              '“Retrieved” is when this tab successfully received the catalog. It is not when prices changed. “Newest listed” uses the catalog creation timestamp, not a guaranteed model release date.',
              '“获取于”表示此标签页成功读取目录的时间，不是价格变化时间。“最新上架”采用目录创建时间，并非确切的模型发布日期。',
            )}
          </p>
          <p>
            {t(
              'After an initial load, an open visible tab checks for a refresh when data is six hours old. Failures preserve the previous result and show a warning. Refreshes have a one-minute cooldown and respect Retry-After. An imported file has an unknown source age and is never automatically replaced.',
              '首次加载后，打开且可见的标签页会在数据满六小时后刷新。失败时保留旧结果并显示警告。刷新至少间隔一分钟，并遵循 Retry-After。导入文件的原始时效未知，且不会被自动替换。',
            )}
          </p>
        </article>
        <article className="panel">
          <Scale size={23} />
          <h2>{t('Recommendations you can inspect', '可检验的推荐依据')}</h2>
          <p>
            {t(
              'Scenario chips apply hard filters: coding requires tools and text; chat requires text; documents require text and ≥128K context; batch processing requires text and structured_outputs or response_format; vision requires image input and text output; budget requires known text prices. These are matching candidates, not claims of best quality.',
              '场景入口使用硬筛选：代码要求工具与文本；聊天要求文本；文档要求文本及 ≥128K 上下文；批量处理要求文本及 structured_outputs 或 response_format；视觉要求图像输入与文本输出；预算要求已知文本价格。这些是符合条件的候选模型，不是最佳质量结论。',
            )}
          </p>
          <p>
            {t(
              'Default ranking is estimated monthly cost ascending. A custom preference ranking uses only normalized cost and context in the filtered set:',
              '默认按估算月费升序排列。自定义偏好排序只采用筛选集合中的归一化成本与上下文：',
            )}
          </p>
          <code className="formula-inline">
            w × (1 − cost / max(1, maxCost)) + (1 − w) × context / max(1, maxContext)
          </code>
          <p>
            {t(
              'w is your cost weight. Missing cost ranks last; missing context contributes zero. Ties use model ID. Changing filters changes normalization. There is no capability score, licensed benchmark, or fabricated price history.',
              'w 是你设定的成本权重。未知成本排在最后，未知上下文贡献零。并列时按模型 ID 排序。筛选变化会改变归一化范围。没有能力分数、未经授权的评测或虚构价格历史。',
            )}
          </p>
        </article>
        <article className="panel">
          <Code2 size={23} />
          <h2>{t('Private by architecture', '用架构保护隐私')}</h2>
          <p>
            {t(
              'This is a static, open-source frontend. Workload calculations and imports run in your browser. Theme and language preferences use local storage; the model catalog stays in memory. No analytics, login, database, or server-side catalog mirror is included.',
              '这是一个静态开源前端。用量计算和导入在浏览器本地完成。主题与语言偏好保存在本地存储，模型目录只留在内存中。不含分析追踪、登录、数据库或服务器目录镜像。',
            )}
          </p>
          <p>
            {t(
              'A direct API request exposes ordinary connection information to OpenRouter. New share links keep model IDs and workload in the URL fragment (#), which is not sent to the host. Older query-based links still work but may appear in hosting logs. Links remain visible to recipients and browser history; they contain no keys, prices or prompts. Recipients load their own data.',
              '直接 API 请求会向 OpenRouter 暴露普通连接信息。新分享链接将模型 ID 与用量放在 URL 的 # 片段中，不发送给托管服务器。旧查询参数链接仍可读取，但可能出现在托管日志中。链接对接收者和浏览器历史仍然可见，不含密钥、价格或提示词。接收者加载自己的数据。',
            )}
          </p>
          <p>
            {t(
              'The project code uses MIT. Third-party data, trademarks, and any future benchmarks retain their own rights. Review source terms before deploying a public integration. No blanket redistribution permission is claimed.',
              '项目代码采用 MIT。第三方数据、商标及未来可能引入的评测保留各自权利。公开部署数据集成前需核对来源条款，不主张拥有一揽子再分发许可。',
            )}
          </p>
          <a href="https://openrouter.ai/terms" target="_blank" rel="noreferrer">
            {t('OpenRouter terms', 'OpenRouter 使用条款')}
            <ArrowUpRight size={14} />
          </a>
        </article>
      </div>
      <article className="panel method-full">
        <h2>{t('What a cost estimate includes', '费用估算包含什么')}</h2>
        <p>
          {t(
            'Per call = input tokens × [(1 − cache hit ratio) × input rate + cache hit ratio × cache-read rate] + output tokens × output rate + known request fee. Daily calls = daily users × calls per user. Monthly calls = daily calls × selected days. Daily cost = per-call cost × daily calls. Monthly cost = daily cost × days. Annual cost = monthly cost × 12.',
            '单次费用 = 输入 Token × [(1 − 缓存命中率) × 输入价 + 缓存命中率 × 缓存读取价] + 输出 Token × 输出价 + 已知请求费。每日调用量 = 日用户数 × 每用户调用次数。每月调用量 = 每日调用量 × 设定天数。日费用 = 单次费用 × 日调用量。月费用 = 日费用 × 天数。年费用 = 月费用 × 12。',
          )}
        </p>
        <p>
          {t(
            'Missing cache-read rates fall back to normal input pricing with a warning. An unspecified request fee is assumed zero with a warning. Unknown or dynamic token prices are unavailable, never treated as free. Non-text-output models are not estimated. Input plus output must fit known context and output limits.',
            '缺失缓存读取价时使用普通输入价并提示。未指定的请求费按零计算并提示。未知或动态 Token 价格显示不可估算，绝不当作免费。非文本输出不进行文本估算。输入与输出必须满足已知上下文和输出限制。',
          )}
        </p>
        <p>
          {t(
            'The calculator excludes cache writes, tier thresholds, long-context premiums, image/audio/video charges, tools, taxes, platform/payment fees and provider routing differences. Enter billed reasoning tokens in output usage when applicable. Free models may be quota-limited. Review the source before making a purchase or production commitment.',
            '计算器不含缓存写入、阶梯阈值、长上下文附加费、图像/音频/视频费用、工具、税费、平台及支付手续费和路由差异。适用时请在输出用量中计入计费的推理 Token。免费模型可能有配额限制。采购或投产前请核实来源。',
          )}
        </p>
      </article>
      <article className="panel method-full">
        <h2>{t('Scheduled checks, not a data mirror', '定期检查，而非数据镜像')}</h2>
        <p>
          {t(
            'The repository includes an opt-in GitHub Actions check every six hours and a manual trigger. It validates the API response, records success/failure metadata in an artifact, and never commits model data or redeploys the site. It is disabled until the maintainer enables the repository variable after reviewing source usage rights. Check history lives in Actions; it does not prove the browser catalog is current.',
            '仓库包含可选的每六小时 GitHub Actions 检查和手动触发。它验证接口响应，将成功或失败元数据保存为构件，不提交模型数据，也不重新部署网站。维护者核对来源使用权并启用仓库变量前，该任务不会请求 API。检查历史位于 Actions，不代表浏览器中的目录一定是最新。',
          )}
        </p>
        <p>
          {t(
            'No authenticated proxy or secret is required for the currently observed public catalog. If authentication or CORS requirements change, the app shows an error and supports manual import; do not add a secret to VITE_ variables.',
            '当前实测公共目录不需要认证代理或密钥。如果认证或跨域要求变化，应用会显示错误并支持手动导入；不要把密钥加入 VITE_ 变量。',
          )}
        </p>
      </article>
    </section>
  )
}
