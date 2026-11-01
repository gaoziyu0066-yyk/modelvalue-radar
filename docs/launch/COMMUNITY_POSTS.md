# Community launch drafts / 社区介绍文案

**Local preparation only. Nothing has been posted.** Replace `REPO_URL` with the actual public repository URL. Add `DEMO_URL` only after deployment and a signed-out smoke test. Remove the demo sentence if there is no hosted demo. Verify source/display permissions before distributing screenshots. Each platform needs a separate human review and publication decision; approval to push code is not approval to post.

## Hacker News — author writing brief

HN's [guidelines](https://news.ycombinator.com/newsguidelines.html) explicitly say to write your own text and not put generated text in posts. Therefore this section is an **editorial fact sheet, not a ready-to-paste submission**. The maintainer should write the title, introduction and replies in their own words. [Show HN guidance](https://news.ycombinator.com/showhn.html) favors something people can actually try, ideally without signup, and asks authors to be available for discussion.

Facts available for your own introduction:

- Name: ModelValue Radar; an open-source static app for comparing model pricing under one workload.
- Working flow: source load → users/calls/tokens → up to three candidates → shared comparison.
- Technical choices: React/TypeScript/Vite, browser-only calculation, no login/database/inference calls.
- Distinction: missing price is not free; cache discounts need data; the recommendation rules are visible metadata filters, not quality ratings.
- Deliberate limits: estimates are not bills; no endpoint-specific tier simulation, benchmark scores or historical price series; source access is external.
- Things to invite technical feedback on: whether exclusions are clear, how to communicate routed-provider prices, and which workload assumptions are missing.

Personal points only the author can supply: what prompted you to build it, which decision you actually used it for, and which tradeoff you found difficult. Do not invent a customer story, savings figure or development history. Title direction: use the required Show HN prefix if submitting there, the product name, and a plain description of workload-based cost comparison. Avoid superlatives. Provide working repo/demo links and remain available for questions; do not solicit votes or coordinate promotion.

中文说明：HN 不适合直接复制 AI 生成的投稿文字。以上是已核实的事实提纲，请你按真实经历亲自写标题、介绍与回复。没有可试用结果时先不要提交 Show HN。

## Reddit — editable draft

Suggested title: **I built an open-source AI model cost calculator that compares the same workload across models**

Draft body (review and adapt to the specific community):

> I'm the creator of ModelValue Radar, a free, open-source tool for estimating AI model costs from users, calls and token usage.
>
> You load the official OpenRouter catalog, enter a workload, and compare up to three models with the same assumptions. You can filter by context, modality and declared API parameters, then share the model IDs and workload in a link.
>
> The calculator distinguishes missing prices from zero prices, uses cache-read rates only when known, and shows excluded charges. These are text-token estimates, not provider bills. The scenario filters don't claim to measure model quality, and there are no invented benchmark scores or price histories.
>
> It's a static React/TypeScript app: no login, database, API key or paid inference request is required under the currently observed public catalog access. You can run it locally with Node and npm. The source catalog stays in browser memory.
>
> Repo: REPO_URL
>
> Demo, if deployed and verified: DEMO_URL
>
> I'd appreciate feedback on the workload inputs and whether the pricing limitations are clear enough to make the estimates useful. Three small contribution drafts are included for people who want to improve accessibility or model details.

Before posting: choose one genuinely relevant community, read its current rules/sidebar and self-promotion requirements, use its required flair, and identify yourself as the creator. Remove placeholders and the conditional demo wording. Do not repost identical text across unrelated communities or ask for votes. Reddit's [spam policy](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) is a baseline; individual community rules can be stricter. No particular subreddit has approved this project.

## V2EX — 中文草稿

标题建议：**做了一个开源的 AI 模型费用计算器：按实际用量比较，支持中英文**

> 大家好，这是我的第一个开源项目 ModelValue Radar，用来回答一个比较具体的问题：如果我的应用每天有一定数量的用户，每人调用几次，每次输入和输出多少 Token，换用不同模型大概需要多少钱？
>
> 目前可以加载 OpenRouter 官方模型目录，按上下文、模态、API 参数和预算筛选，最多同时比较三个模型，再通过链接分享模型选择和工作负载。支持中英文、深浅主题和手机访问。
>
> 计算过程是公开的：未知价格不会当成免费，缓存读取价格缺失时不会虚构折扣，也会提示阶梯计费、工具、图片等未纳入估算的费用。场景入口只是根据参数找候选模型，不是能力排行榜。
>
> 技术栈是 React + TypeScript + Vite，纯前端，不需要登录、数据库或调用推理 API。模型目录只保存在当前页面内存中；项目代码用 MIT，第三方数据另按来源条款处理。
>
> 仓库：REPO_URL
>
> 在线体验（上线验证后再保留这一行）：DEMO_URL
>
> 欢迎反馈：输入项是否贴近你的实际使用方式？哪些费用边界还不够清楚？仓库里也准备了三个范围较小的新手贡献任务。

发布前按 [V2EX 社区帮助](https://www.v2ex.com/help) 选择与作品介绍相关的节点，并阅读该节点当时的要求。以上是草稿，不代表已获节点许可。无需购买推广或图片服务；可在许可明确后链接仓库里的真实截图。请根据你自己的真实经历调整第一人称内容，不添加虚构用户数、节省金额或测评成绩。
