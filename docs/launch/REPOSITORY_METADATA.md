# GitHub repository metadata — ready to apply after approval

No remote repository or GitHub settings were changed. Use these values when the repository exists.

| Field                  | Value                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository name        | `modelvalue-radar`                                                                                                                            |
| Display name           | ModelValue Radar                                                                                                                              |
| Description            | Compare AI model prices for your workload. Estimate token costs, compare up to three models, and share your shortlist. Open source, no login. |
| Website                | Leave empty until the deployed URL has passed the launch checklist.                                                                           |
| License                | MIT for original code; third-party rights separate.                                                                                           |
| First intended release | `v0.1.0` — early release; draft notes prepared, no tag yet.                                                                                   |

Suggested Topics (copy individually):

```text
ai
llm
model-comparison
cost-calculator
token-pricing
openrouter
developer-tools
react
typescript
vite
data-visualization
github-pages
```

All describe implemented functionality. Do not add benchmark, model-training, local-inference or real-time-price claims. Do not add fabricated stars, adoption statistics, performance badges or hosted-CI badges before the corresponding resource exists.

## Maintainer edits before launch

- Record the actual owner and repository URL here; use them to replace `REPO_URL` in the local release/community drafts.
- Set `DEMO_URL` only after a signed-out browser can use the deployed site. Do not replace it with localhost or an undeployed URL.
- Keep `private: true` in `package.json` unless intentionally publishing an npm package. That field prevents accidental npm publication; it does not make the GitHub repository private.
- Enable Issues and private vulnerability reporting; publish a real reporting channel in SECURITY.md if needed.
- Create `good first issue`, `help wanted`, `accessibility` and `enhancement` labels if absent; file the three reviewed issue drafts individually after approval.
- Keep the demo/release status in both READMEs synchronized with reality. The clone instructions deliberately work with the current repository's Download ZIP/Code menu rather than inventing an owner URL.

中文简介备选（用于个人主页等）：按实际用量比较 AI 模型价格，计算应用预算，分享最多三个模型的对比结果。开源、无需登录、不虚构能力评分。
