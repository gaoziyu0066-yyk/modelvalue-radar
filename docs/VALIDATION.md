# Verification record

This file preserves the initial-release checks. The subsequent [engineering review](ENGINEERING_REVIEW.zh-CN.md) records expanded coverage and fixes; its results supersede the initial counts below.

Recorded for the initial local release on **2026-11-01 (Asia/Shanghai)**. These are executed local checks, not claims about an uncreated GitHub repository or a deployed service.

## Environment

- Windows / PowerShell; Node **24.22.1**; npm **11.6.2**.
- The supplied environment had Node but no `npm` command in PATH. npm was bootstrapped into the parent workspace's `.tooling/package/`; standard npm scripts were executed through `node ../.tooling/package/bin/npm-cli.js ...`. This helper is **not** part of the repository and is unnecessary on a normal Node/npm installation.
- Browser verification used installed **Microsoft Edge 156.0.4314.58**, driven headlessly by Playwright, with `PLAYWRIGHT_CHANNEL=msedge`. Desktop: 1440 × 1000. Mobile: Pixel 7 emulation. Product captures additionally used 390 × 844.
- Standard Playwright Chromium / headless-shell downloads were attempted but interrupted by TLS/network failures. No claim of a completed bundled-Chromium run is made. CI is configured to install standard Chromium.
- The local network required its existing proxy and system CA trust for reliable source/audit access. For Node CLI checks, `NODE_OPTIONS='--use-system-ca --use-env-proxy'` resolved this; screenshot automation used the existing HTTPS proxy in memory. No credentials or machine proxy values were written to project files, and certificate validation was not disabled.

## Executed results

| Check                       | Result                                                                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm dependency installation | Passed, lockfile committed; final install audited 322 packages.                                                                                                                                                            |
| `npm run dev`               | Vite started successfully; local HTTP request returned 200.                                                                                                                                                                |
| `npm run lint`              | Passed with zero warnings after fixing the new hooks purity rule using a lazy time initializer.                                                                                                                            |
| `npm run test:coverage`     | **64 tests passed**, six test files, Vitest 5.0.5.                                                                                                                                                                         |
| Cost-engine coverage        | **100% lines**, 90.56% branches; includes independent math examples and invalid/unknown/cache/context/overflow cases.                                                                                                      |
| Overall `src/lib` coverage  | 83.33% lines, 73.83% branches; not a claim about full UI coverage.                                                                                                                                                         |
| `npm run build`             | Passed strict TypeScript and Vite production build.                                                                                                                                                                        |
| `npm run test:e2e`          | **28 passed** across desktop and mobile projects after fixes; includes search, pagination, hard filters, max-three selection, math, clipboard denial, share restore, imports, refresh failure, keyboard dialog and layout. |
| axe checks inside E2E       | No violations for the tested WCAG 2 A/AA and 2.1 AA rules on discovery, calculator and comparison in both themes/viewport projects.                                                                                        |
| `npm run test:build`        | Passed actual production `/modelvalue-radar/` asset loading, lazy chunks, shared state, hash navigation and page reload; no HTTP/page errors.                                                                              |
| Workflow YAML               | All three workflow files parsed; required trigger/job structures checked locally.                                                                                                                                          |
| Live source check           | Successful official API response: **452 validated models, 0 rejected**, metadata-only report. Failure handling was also exercised during network trouble.                                                                  |
| Runtime dependency audit    | Zero reported vulnerabilities.                                                                                                                                                                                             |
| Final full dependency audit | Zero reported vulnerabilities after updating development tools and the documented minimatch override.                                                                                                                      |
| Product captures            | Six real screenshots from a direct official API load, 452 models, no page errors; no model catalog saved.                                                                                                                  |

`npm run format:check` passed in final packaging and is also required by CI. Local links in the README, contribution, security and validation documents were checked successfully. Unit tests use explicitly synthetic `TEST ONLY` models. E2E stubs the external API for deterministic testing; source connectivity is checked separately and never faked by those tests. The production-path smoke test also uses test fixtures through network interception, not in the build.

## Failures found and corrected

1. Strict export linting required moving the cost-label hook out of a component module.
2. A JSX delimiter in the insights page prevented compilation and was fixed before build success.
3. Structured `pricing.overrides` arrays initially rejected 82 valid API records. The parser now preserves the model and flags such fields as excluded advanced charges; a regression test covers it.
4. Initial light-theme secondary text and primary buttons failed contrast checks. Colors were corrected, and prose links were underlined.
5. Mobile horizontal-table interactions failed hit testing. Mobile rows now use a labeled grid with visible actions, and the complete mobile flow suite passes.
6. A chart test counted legend SVGs as charts; it now checks chart containers while retaining the exact-value table assertions.
7. Tiny positive prices could visually round to zero. Formatting now preserves positive precision; overflow is unavailable rather than an infinite bill.
8. The initial full dependency audit found vulnerable development tools. Vitest/coverage and ESLint were upgraded, a narrow transitive minimatch fix documented, and all checks rerun. No blind forced downgrade was used.

## Practical limits

- Automated Chromium-engine viewport tests are not real iOS/Android device tests, Firefox/Safari coverage, a screen-reader audit or universal WCAG certification.
- The source API can be unreachable, throttled or changed. Anonymous access and CORS were observed, not guaranteed. Data-use/redistribution permission is not implied by a successful request.
- GitHub Actions/Pages files are configured and locally inspected; they have **not run on GitHub**. No account, remote repository, push or external publication was performed.
- The build emits non-fatal Rollup warnings about two upstream Zod `@__PURE__` comments; they are removed during bundling and do not prevent the build.
- Screenshot values are dated observations. Cost estimates exclude the advanced charges documented in the UI and data policy; no capability benchmarks or historical price snapshots are supplied.

## Reproduce

```bash
npm ci
npm run format:check
npm run lint
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:build
npm audit
```

To reproduce real screenshots, run the development server and `npm run screenshots`. This makes an external source request and writes only screenshots/provenance under `docs/screenshots/`. Use `PLAYWRIGHT_CHANNEL=msedge` for the local fallback and, only on a network that already configures `HTTPS_PROXY`, `CAPTURE_USE_PROXY=true` to pass that existing proxy to the capture browser. Do not publish proxy credentials.
