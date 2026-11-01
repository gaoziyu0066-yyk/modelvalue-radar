# Screenshots and recording guide / 产品媒体指南

All assets below were captured from this application using the real official API. See the [timestamp and provenance](../screenshots/README.md). Numbers are observations at capture time, not current quotes. Review [third-party rights](../../THIRD_PARTY_NOTICES.md) before public distribution. No GIF or video has been recorded for this delivery; the walkthrough below is a recording plan.

## Available images

| File                                                          | Suggested use               | English / Chinese alt text                                                           |
| ------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| [explore-dark.png](../screenshots/explore-dark.png)           | README hero                 | Model discovery with workload-cost sorting / 按工作负载费用排序的模型发现页          |
| [compare.png](../screenshots/compare.png)                     | Feature preview             | Three models compared under one workload / 同一工作负载下的三个模型对比              |
| [calculator.png](../screenshots/calculator.png)               | Calculator walkthrough      | Token workload, monthly estimate and exclusions / Token 工作负载、月度估算与费用边界 |
| [explore-light.png](../screenshots/explore-light.png)         | Theme preview               | Model discovery in light theme / 浅色主题模型发现页                                  |
| [mobile-zh.png](../screenshots/mobile-zh.png)                 | Mobile/localization preview | Chinese model discovery on mobile / 中文移动端模型发现页                             |
| [mobile-calculator.png](../screenshots/mobile-calculator.png) | Mobile calculator           | Workload inputs on a narrow screen / 窄屏上的工作负载输入                            |

Desktop captures use a 1440px viewport; mobile captures use 390px. Images are full-page screenshots, so their heights exceed the viewport. Layout regression tests separately cover exact 375px, 768px and 1440px widths. The [review images](../review/README.md) contain **TEST ONLY** records: do not use them as real-price marketing assets.

## Refresh the captures

Start `npm run dev` in one terminal. In a second terminal, after installing the Playwright browser with `npx playwright install chromium`:

```powershell
$env:PREVIEW_URL='http://127.0.0.1:5173/'
npm run screenshots
```

On macOS/Linux: `PREVIEW_URL=http://127.0.0.1:5173/ npm run screenshots`. Use the actual server port. The script's default is port 4173 for a production preview. If Edge is already installed, PowerShell may use `$env:PLAYWRIGHT_CHANNEL='msedge'` instead of downloading Chromium. `CAPTURE_USE_PROXY=true` is an optional adapter for an already configured environment proxy, not a public service or required credential.

The script loads the real catalog, writes six PNGs and their provenance note, and reports browser errors. It does not save a JSON catalog. Inspect images yourself after each run. A failed network request is a failed capture: do not substitute synthetic models, generated mockups or old images while claiming a new capture. Keep the date visible in the accompanying description.

## A 90-second walkthrough

Record the browser content at a readable desktop size using a local recorder. Disable desktop notifications, hide personal tabs/bookmarks and use an illustrative workload rather than private application usage. Keep native resolution or export a readable 1080p video. Add captions; narration is optional. A short WebM/MP4 with a PNG poster is generally easier to read than a large GIF.

| Time   | Actual interaction                                                                                                                                        | Suggested caption / 字幕                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 0–10s  | Show Explore; click **Load official catalog** and wait for success. Keep the retrieval status visible.                                                    | Compare model prices using your workload. / 用你的工作负载比较模型费用。                                              |
| 10–25s | Search an entry present in the loaded source; clear the search, choose a scenario, open Filters.                                                          | Declared parameters narrow the candidates; these are not quality scores. / 根据目录参数筛选候选模型，不代表质量排名。 |
| 25–45s | Open Calculator. Enter 100 users, 5 daily calls/user, 1,000 input tokens, 500 output tokens, 30 days. Change one input and pause on the updated estimate. | An estimate from explicit assumptions, with excluded charges shown. / 根据明确假设估算，并展示未包含的收费。          |
| 45–55s | Adjust cache hit rate. If the selected model has no cache-read price, show the warning rather than promising savings.                                     | Cache discounts need a known cache-read rate. / 已知缓存读取价格时才计算折扣。                                        |
| 55–70s | Return to Explore, add up to three real entries, open Compare, scroll between charts and table.                                                           | Every model uses the same workload. / 所有模型使用同一工作负载。                                                      |
| 70–80s | Copy a share link; open it in a fresh tab and load data.                                                                                                  | The link shares IDs and assumptions, not a frozen price snapshot. / 链接分享模型与假设，不锁定历史价格。              |
| 80–90s | Switch Chinese/light theme and demonstrate a narrow viewport. End on the real repository URL only after it exists.                                        | Open source. No login. Run locally. / 开源、无需登录、可本地运行。                                                    |

Do not hard-code a model name or projected saving into the script: source availability changes. Retain important warnings. Trim waiting time only if the edit is apparent; do not imply six-hour refreshes are live market ticks. If the source fails, record the honest error/import flow or postpone that take.

中文发布建议：README 先用静态截图，另附 60–90 秒录屏；不要把整段交互压成难以辨认的大 GIF。若制作 GIF，选取实际录制的 8–12 秒单一交互，保留可读字幕，并链接完整视频。此步骤由维护者录制与审核，本次未生成虚假演示视频。
