# Quick Start / 快速开始

[English README](../README.md) · [中文 README](../README.zh-CN.md)

## 1. Install and open / 安装并打开

Use Node.js 24 LTS with npm. Node 22.x is supported from 22.13. Check your terminal:

```bash
node --version
npm --version
```

Get the source using GitHub **Code → Download ZIP**, then extract it, or clone your fork using the URL shown by GitHub's Code menu. This repository has no remote URL configured in the local delivery; no invented clone URL is provided here.

Enter the extracted/cloned `modelvalue-radar` directory containing `package.json`, then run:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173/`. Keep the terminal running. Press **Ctrl+C** to stop. If that port is occupied, use the URL Vite actually prints, or set one explicitly with `npm run dev -- --port 5174`.

中文：安装 Node 24 和 npm，在项目目录中运行以上两条命令，打开终端给出的本地网址。保持终端运行，Ctrl+C 停止。无需配置 `.env`、密钥、数据库或账号；首次安装依赖和加载官方目录需要联网。

## 2. Try a real workflow / 第一次怎么用

1. **Load official catalog / 加载官方目录**: opt into a direct source request. Check the retrieval label; it is not a price-change date.
2. **Explore / 发现**: search a model, choose a scenario or open Filters. Results are matching candidates, not quality scores.
3. **Calculator / 计算器**: select a model; enter, for example, 100 users, 5 calls/user/day, 1,000 input tokens, 500 output tokens and 30 days. These are workload assumptions, not actual traffic statistics. Read the estimate warnings before comparing.
4. **Compare / 对比**: use the + buttons to choose up to three models. Every column uses the same workload. Inspect cost, context and declared parameters; remove a model with ×.
5. **Share comparison / 分享对比**: copy the link or use the manual-copy field if clipboard access is denied. Open it in another tab and load the source there. The link stores IDs and workload, not prices or the catalog.
6. Use the header controls for Chinese/English and light/dark themes. Reload clears the in-memory catalog; theme and language persist.

## 3. If the source cannot load / 来源不可用时

| Symptom / 现象                                 | Action / 处理                                                                                                                                                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty initial catalog / 初始没有模型           | Click Load official catalog; empty does not mean the app failed.                                                                                                                                                      |
| 429 or disabled refresh / 限流、刷新按钮不可用 | Wait for the displayed cooldown. Longer `Retry-After` values are respected; do not bypass it with repeated reloads.                                                                                                   |
| Network/CORS/auth error / 网络、跨域或认证错误 | Check your network. Do not put a source key in frontend code or `VITE_` variables.                                                                                                                                    |
| Need local data / 想导入本地数据               | Import an OpenRouter-compatible JSON object with a `data` array that you have permission to use. Maximum 10 MB / 10,000 records. Unsupported/bad records are rejected or reported. The source age remains unverified. |
| Estimate is “—” / 无法估算                     | Inspect missing/dynamic prices, text input/output support, known context/output limits and workload validity. Unknown is not free.                                                                                    |
| `npm` not recognized / 找不到 npm              | Install Node with npm and reopen the terminal. The optional local-workspace fallback below is not a requirement for other developers.                                                                                 |
| Certificate errors / 证书问题                  | Configure your organization's trusted CA/proxy; do not disable TLS verification.                                                                                                                                      |

No fabricated model list is bundled as a fallback. You can still run the test suite without contacting OpenRouter.

## 4. Build and test / 构建与测试

```bash
npm run licenses:check
npm run lint
npm test
npm run build
npm run preview
```

`dist/` is the static production output. `preview` is a local server, not a hosted deployment. For browser flows:

```bash
npx playwright install chromium
npm run test:e2e
npm run test:build
```

If the download is restricted and Edge is installed, PowerShell users may set `$env:PLAYWRIGHT_CHANNEL='msedge'`. CI installs standard Chromium. The full suite uses local synthetic API fixtures; it does not make paid inference requests. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Local workspace only / 本次工作区专用

The supplied Windows environment has a sibling `.tooling/package/bin/npm-cli.js`. If it exists, run from `modelvalue-radar`:

```powershell
node ..\.tooling\package\bin\npm-cli.js run dev
```

This helper is outside the repository. It must not be published and is unnecessary on a normal Node/npm installation. Browser tests use the same replacement for `npm`. No system-wide configuration change is required.

For public deployment, use the [GitHub Pages checklist](launch/GITHUB_PAGES_CHECKLIST.md), including the source-permission review.
