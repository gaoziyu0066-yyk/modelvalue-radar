# ModelValue Radar

**Find the best AI model for your budget. — 找到适合你预算的 AI 模型。**

免费、开源的 **AI 模型对比与成本计算器**，面向开发者、学生和 AI 爱好者。通过透明的价格和计算方法，筛选候选模型、规划应用预算，并比较最多三个方案。

[English](README.md) · [贡献指南](CONTRIBUTING.md) · [数据政策](docs/DATA_POLICY.md) · [安全政策](SECURITY.md)

**在线 Demo 占位地址：** `https://YOUR_USERNAME.github.io/modelvalue-radar/`，尚未发布，部署后请替换。应用不要求登录、数据库、API 密钥、付费服务，也不会调用模型推理接口。

![实际运行的网站截图](docs/screenshots/explore-dark.png)

这是使用 OpenRouter 官方响应运行的网站实拍，不是设计稿。截图只反映获取时刻，不保证当前价格。[更多截图及采集说明](docs/screenshots/README.md)。

## 已实现功能

| 模块     | 功能                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 模型发现 | 名称/ID 搜索，提供商、模态、API 参数、上下文、输入输出价格、月预算组合筛选与分页。         |
| 价格排行 | 最低输入/输出价、免费文本 Token、最新目录记录、长上下文、指定工作负载的月成本排序。        |
| 成本计算 | 日活、每天调用次数、输入输出 Token、每月天数、缓存命中率；计算单次、每日、每月、年度费用。 |
| 并排对比 | 最多三个模型，价格图、月费图、上下文、完整 API 参数、特性声明与费用差额。                  |
| 场景候选 | 代码、聊天、长文档、批量结构化处理、图像理解、预算优先；可自定义成本与上下文偏好权重。     |
| 可视化   | 输入/输出价格散点图、价格上限过滤、交互提示及无障碍数据表。                                |
| 分享     | 复制结果、分享模型 ID 和用量；剪贴板不可用时可手动复制。                                   |
| 数据时效 | 上次成功获取时间、六小时过期提醒、失败保留、未知及动态价格明确标记。                       |

默认深色，可切换浅色与中英文。窄屏模型表自动变为带字段标签的紧凑列表。支持键盘焦点、语义表格、原生模态对话框、Skeleton、错误/空状态和减少动态效果设置。

**价格排名不等于能力排名。** 场景入口只给出“符合条件的候选模型”。没有虚构能力分数、评测排行或价格历史。

## 本地运行

需要安装 Node.js **22.13 或更高版本**，建议 Node 24，并确保终端可以执行 npm。

```bash
git clone https://github.com/YOUR_USERNAME/modelvalue-radar.git
cd modelvalue-radar
npm install
npm run dev
```

打开 Vite 输出的本地网址。点击 **加载官方目录** 后，浏览器才直接请求 OpenRouter；也可以 **导入 JSON**，使用自己有权使用的目录。初始空状态是有意设计：没有偷偷内置、镜像第三方目录，也没有用假数据填充页面。

```bash
npm run build
npm run preview
npm run lint
npm run format:check
npm test
npm run test:coverage
npx playwright install chromium
npm run test:e2e
npm run test:build    # 验证 /modelvalue-radar/ 子路径生产构建
```

`build` 包含 TypeScript 校验，静态产物位于 `dist/`。`preview` 仅用于本地预览，不是生产服务器。复现锁定版本请用 `npm ci`。

需要改变部署路径时，可复制 `.env.example` 为 `.env`。**所有 `VITE_` 变量都会公开，绝对不要放密钥。** 若浏览器下载受限，本机已有 Edge 时可使用：

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

CI 仍使用标准 Chromium。受限网络应正确配置代理及受信任 CA，不要关闭证书验证。来源无法访问时，页面会显示明确错误，手动导入仍可用。

## 成本公式

内部价格单位为 **美元 / Token**，展示时乘以 1,000,000。

```text
单次费用 C = I × [(1 − h) × Pi + h × Pc] + O × Po + R
每日调用量 = U × N
每月调用量 = U × N × D
每日费用   = C × U × N
每月费用   = C × U × N × D
年度费用   = 每月费用 × 12
节省费用   = 基准模型月费 − 候选模型月费
```

I/O 为每次输入/输出 Token；h 为输入缓存命中率；Pi/Po 为输入/输出单价；Pc 为缓存读取单价；R 为已知请求费；U 为日用户数；N 为每用户每天调用次数；D 为月度天数。

独立验证案例：1,000 用户 × 每天 5 次 × 30 天；每次 1,000 输入、500 输出 Token；使用**仅用于测试的** $2/$8 每百万费率，结果为 **$900/月**。50% 缓存命中、缓存价 $0.50/百万时，为 **$787.50/月**。这些是数学测试值，并非某个真实模型的报价。

- 未知或动态价格不可估算，不能当作零；非文本输出不做文本费用估算。
- 缓存价未知时，按普通输入价计算并提示；不虚构折扣。
- 请求费未指定时，暂按零处理并提示。
- 超过已知上下文或输出限制会阻止估算，未知上下文单独提示。
- 结构化阶梯覆盖和其他收费字段会被标为未计入，不把基础单价假装成精确账单。
- 不含缓存写入、阶梯及长上下文溢价、图像/音视频、工具、税费、平台费和路由差异。适用时将计费的推理 Token 纳入输出用量。年度表示 12 个设定月份，不一定等于 365 天。免费模型可能有配额及可用性限制。

## 数据来源及权利

默认适配 [OpenRouter 官方模型 API](https://openrouter.ai/docs/api/api-reference/models/get-models)，端点为 `https://openrouter.ai/api/v1/models`。实现时实测匿名 HTTP 200 与浏览器跨域可用，但生成式接口文档同时描述 bearer 认证。**当前可匿名读取，不代表拥有再分发许可，也不保证未来不需要认证。** 前端不会嵌入、索取或保存密钥。

公开运营前请核对 [使用条款](https://openrouter.ai/terms)、[速率限制说明](https://openrouter.ai/docs/api-reference/limits) 和 [详细数据政策](docs/DATA_POLICY.md)。尚未确认完整目录的明确镜像/再分发授权，因此项目**不内置生产目录快照，不做服务器镜像，不提交模型数据**。目录由用户主动加载，仅存在当前内存中；没有持久化目录缓存，也不提供完整目录导出。导入文件留在设备内，原始时效标为未验证。

“获取于”是当前标签页成功收到数据的时间，**不是价格实际变动时间**。`created` 是目录创建时间，不一定是发布日期。ID 前缀代表模型作者，不一定是实际推理服务商。特性支持来自来源声明，并非独立评测；手动导入的数据也不会被宣称为独立验证。

项目代码采用 MIT。**第三方数据、品牌商标、未来可能引入的基准数据不自动获得 MIT 授权。** 测试数据均使用 `TEST ONLY` 标识，且不会出现在生产页面中。本项目不内置 Demo Data。

## 自动刷新与定期检查

- 用户加载后，**打开且可见的标签页**在目录满六小时时刷新；隐藏/关闭标签页不轮询。这是周期性获取，不是秒级实时行情。
- 刷新失败保留之前成功的数据，显示失败/过期提示。请求至少间隔一分钟，并遵循更长的 `Retry-After`。
- `.github/workflows/check-data.yml` 提供手动触发及 `17 */6 * * *`（UTC）计划任务。默认关闭；核对数据使用权后，设置仓库 **Actions 变量** `ENABLE_CATALOG_CHECK=true`。
- 检查只在内存中验证 API，将状态、记录数、时间和失败原因上传为保留 30 天的构件。每次结果可在 Actions 摘要查看，之前成功的运行记录保留最后成功检查时间。
- 该任务不提交目录、不修改现有网站、不触发重新部署，因此失败不会破坏网站，也没有重复数据提交。
- 浏览器“获取时间”和 CI 检查时间是两次不同请求，不会混淆展示。GitHub 计划任务可能延迟或停用，不构成可用性保证。
- 未启用变量时，定期任务跳过；浏览器刷新/导入独立可用。未来取得快照授权后，可通过 `DataProvider` 扩展，并明确保留期限和回退机制。

本地手动健康检查：

```powershell
$env:CATALOG_CHECK_ENABLED = 'true'
npm run check:data
```

## 技术架构

React + 严格 TypeScript + Vite；Tailwind CSS 4；本地维护的 shadcn/ui 风格 Radix/CVA 按钮；Recharts；Lucide；Zod；Vitest + React Testing Library；Playwright + axe；GitHub Actions + Pages。

表单和对话框使用带标签的原生语义控件。轻量 hash 导航无需额外路由包，GitHub Pages 不需要重写规则。图表与次要页面懒加载，系统字体避免请求外部字体服务。本地存储只保存主题和语言。

```text
src/
  components/ui/    本地 UI 基础组件
  components/       图表、表单、状态、模型详情
  pages/            发现、计算器、对比、洞察、方法说明
  hooks/            数据生命周期、语言、成本提示
  lib/              计算、过滤、分享校验、数据适配
  types/            模型、目录、用量类型
  test/             仅供测试的 fixture 与 setup
scripts/            元数据健康检查、真实截图采集
tests/e2e/          模拟 API 的确定性浏览器测试
docs/               数据政策、截图、验证结果
.github/            CI、Pages、可选定期检查、Issue/PR 模板
```

## 部署到 GitHub Pages

1. 在自己的账号创建公开仓库 `modelvalue-radar`。公开集成前核对数据使用条款。本次本地交付没有创建远程仓库或推送。
2. 将**本项目文件夹内容作为仓库根目录**，包含锁文件和 `.github/`。不要上传上级工作目录、`.tooling`、`node_modules`、`.env`、`dist` 或本地导入数据。
3. 在 **Settings → Pages → Build and deployment** 选择 **GitHub Actions**。建议将 `github-pages` 环境限制为只能从 `main` 部署。
4. 推送已审核的 `main`，或手动运行 **Deploy GitHub Pages**。工作流先 lint/测试、构建，再上传并部署 `dist`。构建失败不会替换原有部署。
5. 工作流使用 `actions/configure-pages` 输出的 `base_path`，适配项目子路径、用户主页或自定义域名。hash 页面与查询参数分享保留在同一路径下。
6. 将两个 README 的 Demo 占位地址替换为实际部署地址。按需启用上面的定期健康检查及 GitHub 私密漏洞报告功能。

手动构建项目路径时，在 `npm run build` 前设置 `VITE_BASE_PATH=/modelvalue-radar/`。PowerShell 示例：`$env:VITE_BASE_PATH='/modelvalue-radar/'`。自定义域名使用 `/`。参考 [Vite 官方部署文档](https://vite.dev/guide/static-deploy) 和 [GitHub Pages 工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

CI 使用模拟 API 测试，不消费模型接口。真实 API 检查是独立、默认关闭的任务。远程 Actions 与真正上线需要你的 GitHub 账号，本地交付不冒充已经运行过远程部署。

## 验证与限制

本轮发布前审查覆盖 375px / 768px / 1440px 三种视口，补充导入并发保护、微小费用精度、键盘可滚动表格及全部五个页面的自动无障碍检查。当前结果与剩余发布条件见 [工程审查报告](docs/ENGINEERING_REVIEW.zh-CN.md)。

新分享链接采用 `#compare?s=…`，模型 ID 和用量不发送给静态托管服务器。旧查询参数链接仍兼容，但可能出现在托管日志中；所有分享链接仍对接收者和浏览器历史可见。复制本地导入的对比结果时，会保留来源未验证说明及模型对应的计费警告。

实际命令、结果及环境限制见 [VALIDATION.md](docs/VALIDATION.md)。浏览器测试覆盖 Chromium 内核的桌面及手机视口，axe 提供基础自动检查，不等同于全面无障碍认证。没有声称测试过实体 iOS/Android 设备或生产 GitHub 环境。

上游可用性、元数据正确性、价格阶梯与数据许可仍有边界。不会通过虚构离线数据、能力分数或趋势掩盖这些限制。分享链接加载接收者自己的当前数据，不冻结价格。

## 贡献与 Roadmap

欢迎阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)，提交小而明确的修复、翻译、无障碍改进或有文档依据的数据适配器。

- [ ] 取得可再分发、可版本化模型快照的书面授权。
- [ ] 按具体端点、长上下文阶梯及缓存写入进行更完整估算。
- [ ] 引入获授权且标注指标/版本的真实基准。
- [ ] 增加实体设备及更多浏览器的无障碍测试。
- [ ] 仅在存在真实、获准保留的快照后展示历史趋势。
- [ ] 增加有来源和日期的汇率换算。

版本记录见 [CHANGELOG.md](CHANGELOG.md)。本项目独立开发，与 OpenRouter 或模型提供商无隶属关系。
