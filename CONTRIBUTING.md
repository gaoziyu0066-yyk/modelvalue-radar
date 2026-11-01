# Contributing

Thank you for helping developers make better-informed model choices. English and Chinese issues and pull requests are welcome.

## Set up

Use Node.js 24 with npm (22.x from 22.13 is also supported). See the bilingual [Quick Start](docs/QUICK_START.md) for installation, a first-use walkthrough and troubleshooting. Run `npm ci`, then `npm run dev`. No account or API key is required under the observed public catalog access. The default UI starts with an empty catalog until the visitor explicitly loads the official API or imports a permitted file.

## Your first contribution / 第一次贡献

Try one of the [three small starter tasks](docs/good-first-issues/README.md). They are local drafts until the maintainer creates actual GitHub issues; each lists a code entry point, scope and acceptance criteria. Check for existing work before starting. On a published issue, leave a short intent-to-work comment so contributors can coordinate. English and Chinese questions and draft pull requests are welcome.

Once a real upstream repository exists, fork it in GitHub, clone the URL of your fork, and create a focused branch such as `git switch -c fix/workload-hints`. Reproduce the issue, make the smallest useful change, run the applicable checks below, then open a PR against upstream `main`. Explain the previous behavior and the new behavior; include screenshots for visible changes and exact test results. Do not claim a check passed if it was not run.

中文：从一个小问题开始即可，不必重写整个模块。提交时说明如何复现、改了什么、实际运行了哪些检查；遇到环境限制也请直接说明。不要提交本地用户数据、下载的完整模型目录或密钥。

## Before a pull request

1. Keep the change focused and explain the user-visible behavior.
2. Run `npm run format`, `npm run licenses:check`, `npm run lint`, `npm test`, and `npm run build`. Use `npm run format:check` to verify without rewriting. Documentation-only changes also need working relative links and claims consistent with the implementation.
3. For user flows, install Chromium with `npx playwright install chromium` and run `npm run test:e2e`. For browser-download restrictions, set `PLAYWRIGHT_CHANNEL=msedge` if Edge is already installed. CI uses standard Chromium.
4. Include dark/light, English/Chinese, keyboard, mobile and reduced-motion checks for changed UI.
5. Add regression tests for changed calculation, parsing, filtering, or URL state behavior. Use synthetic **TEST ONLY** fixtures in tests; never import those fixtures in production pages.
6. Do not introduce credentials, tracking, unnecessary services or model-calling fees.
7. For base paths, asset loading or deployment changes, run `npm run test:build`. `npm run test:coverage` reports the configured logic coverage thresholds. Use `npm test -- src/lib/cost.test.ts` for a focused unit run while iterating.
8. After dependency changes, run `npm ci`, `npm run licenses:generate`, review the license/NOTICE diff and run `npm run licenses:check`. Keep generated notices in the PR so production builds retain the required texts. See [third-party notices](THIRD_PARTY_NOTICES.md). Do not copy third-party code under the project MIT license without checking its terms.

CI verifies formatting, license notices, lint, coverage, build and browser behavior. Deployment runs its own checks before uploading. No remote push, deployment, release or community posting should be performed on a maintainer's behalf without authorization.

## Data contributions

Propose a provider adapter in `src/lib/catalog.ts` (the `DataProvider` interface). Supply an official documented endpoint, schema, units, timestamps, usage terms and explicit permissions for any caching or redistribution. Runtime validation is mandatory. Do not scrape pages or check in a downloaded catalog. Prices of zero, unknown, and dynamic must remain distinct. Retrieved time is never a price-change date.

Benchmark proposals must include the benchmark name, metric, version, methodology, source and explicit display permission. Subjective recommendations cannot masquerade as measured capability. Price history requires real dated snapshots and rights to retain and display them.

## Project conventions

- Keep math and selection logic pure; keep browser state in hooks.
- All prices are internally USD/token; convert only at display boundaries.
- Use bilingual `t(English, Chinese)` strings and semantic elements.
- Local shadcn/ui-style components are owned source, not an opaque UI service.
- Do not modify unrelated directories or publish on behalf of maintainers.

By contributing original code, you agree that it is available under the project's MIT license. You retain your copyright. Third-party material needs its own license and attribution.
