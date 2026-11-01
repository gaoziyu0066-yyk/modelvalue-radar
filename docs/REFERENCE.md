# Product and engineering reference

[README](../README.md) · [中文 README](../README.zh-CN.md) · [Data policy](DATA_POLICY.md)

## Cost model / 成本模型

Internal rates are USD/token; displayed token rates are USD/1M. Let `I/O` be per-call input/output tokens, `h` cache hit ratio, `Pi/Po` input/output rates, `Pc` cache-read rate, `R` known request fee, `U` daily users, `N` calls/user/day, `D` active days/month.

```text
C = I × [(1 − h) × Pi + h × Pc] + O × Po + R
Daily calls   = U × N
Monthly calls = U × N × D
Daily cost    = C × U × N
Monthly cost  = C × U × N × D
Annual cost   = Monthly cost × 12
Savings       = baseline monthly cost − candidate monthly cost
```

Independent **test-only** example: 1,000 users × 5 calls × 30 days, 1,000 input / 500 output tokens per call, rates $2/$8 per million → **$900/month**. At 50% cache hits and $0.50/M cache read → **$787.50/month**. These are mathematical fixtures, not model quotes or observed customer savings.

- Unknown/dynamic token rates: unavailable, including zero traffic; not silently free.
- Known zero token rates: zero text-token costs, with quota/availability warning.
- Unknown cache read: ordinary input rate, with warning. Known zero and higher-than-input cache rates are used as given.
- Unknown request fee: assumed zero with warning; known fees also apply to zero-token requests.
- Known context limit: input + output must fit. Known output maximum also applies. Unknown limits are flagged.
- Workload limits: integer users 0–100M, calls/user/day 0–1M, tokens/call 0–100M per direction, 1–31 days; cache ratio 0–1. Out-of-range/blank/NaN values are unavailable.
- Unrepresentable prices/weighted charges do not become zero bills. Very small charges keep nonzero precision; amounts ≥$1T are explicitly approximate scientific notation.
- Tier overrides, long-context premiums, cache writes, media, tools, taxes, platform fees and provider routing differences are excluded. Include billed reasoning tokens in output usage when applicable. Annual means 12 modeled months, not necessarily 365 days.

中文要点：费用按实际输入计算，未知不等于免费；缓存缺价不虚构折扣；金额是文本用量估算，复杂计费项未包含。单元测试使用独立算例核对，而非用实现再次计算“期望值”。

## Candidate rules / 候选规则

| Scenario              | Hard requirement                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Coding                | Text input/output + `tools`                                                              |
| Everyday chat         | Text input/output                                                                        |
| Long documents        | Text input/output + context ≥128K                                                        |
| Batch text processing | Text input/output + `structured_outputs` or `response_format`; no implied batch discount |
| Image understanding   | Image input + text output; image charges excluded                                        |
| Budget first          | Text input/output + known input/output token rates                                       |

Default ranking is monthly estimate ascending. Custom preference ranking is:

```text
w × (1 − cost / max(1, maxCost)) + (1 − w) × context / max(1, maxContext)
```

`w` is cost weight in [0,1]. Normalization uses the currently filtered candidates. Missing cost ranks last; missing context contributes zero; ties use model ID. Changing filters changes the normalization. This is not a capability score.

## Data and refresh / 数据与刷新

The official API is read on demand through `DataProvider`. Zod validates the envelope and records; bad/duplicate records are counted. Nonzero underflow, dynamic or missing prices stay unknown. Model-author labels come from IDs; they are not inference-endpoint guarantees. Current API defaults to text-output catalog entries, not every model of every modality.

After loading, an open visible tab refreshes when data is six hours old. One operation runs at a time. Refresh cooldown is at least one minute and honors longer `Retry-After`. Failures retain the last successful data; imports are never automatically replaced. Retrieval time is local receipt time, not a price-change event.

The optional `check-data.yml` workflow has manual dispatch and `17 */6 * * *` UTC schedule. It is skipped unless the repository Actions variable `ENABLE_CATALOG_CHECK=true` is enabled after a source-rights review. It validates in memory and saves only status/counts/timestamps/error metadata as a 30-day artifact. It makes no data commits, publishes no catalog and does not redeploy. Browser freshness and Actions check time describe different requests. GitHub may delay or disable schedules.

Explicit local source check:

```powershell
$env:CATALOG_CHECK_ENABLED='true'
npm run check:data
```

The CLI reads the process environment; merely editing `.env` does not enable this check. Only Vite build configuration loads `.env`.

## Architecture

```text
src/
  components/ui/  Local Radix/CVA primitives
  components/     Forms, charts, status, details
  pages/          Explore, Calculator, Compare, Insights, Methodology
  hooks/          Catalog lifecycle, language, cost warnings
  lib/            Pure math/filter/share logic and runtime data boundary
  types/          Normalized catalog/model/workload types
  test/           Synthetic fixtures and setup, never served in production
tests/e2e/        Deterministic browser flows
scripts/          Source check, product captures, license notices, Pages smoke
public/           Favicon and dependency notices, copied into dist/
docs/             Setup, methodology, evidence, release and contribution drafts
.github/          CI, Pages, opt-in source check, templates
```

React/TypeScript/Vite, Tailwind, local shadcn/ui-style controls, Recharts/Lucide, Zod, Vitest/Testing Library, Playwright/axe. Native form elements/dialogs retain platform keyboard behavior. Hash routing needs no server rewrite. Charts and secondary pages load on demand; system fonts avoid external font requests.

See [engineering review](ENGINEERING_REVIEW.zh-CN.md) for executed checks and the [launch checklist](launch/GITHUB_PAGES_CHECKLIST.md) for what remains outside local validation.
