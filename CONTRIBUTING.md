# Contributing

Thank you for helping developers make better-informed model choices. English and Chinese issues and pull requests are welcome.

## Set up

Use Node.js 22.13+ (Node 24 recommended). Run `npm ci`, then `npm run dev`. No account or API key is required. The default UI starts with an empty catalog until the visitor explicitly loads the official API or imports a permitted file.

## Before a pull request

1. Keep the change focused and explain the user-visible behavior.
2. Run `npm run format`, `npm run lint`, `npm test`, and `npm run build`.
3. For user flows, install Chromium with `npx playwright install chromium` and run `npm run test:e2e`. For browser-download restrictions, set `PLAYWRIGHT_CHANNEL=msedge` if Edge is already installed. CI uses standard Chromium.
4. Include dark/light, English/Chinese, keyboard, mobile and reduced-motion checks for changed UI.
5. Add regression tests for changed calculation, parsing, filtering, or URL state behavior. Use synthetic **TEST ONLY** fixtures in tests; never import those fixtures in production pages.
6. Do not introduce credentials, tracking, unnecessary services or model-calling fees.

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
