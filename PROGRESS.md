# Implementation log

## Phase 1 — foundation

- Created an isolated repository in the user-selected workspace.
- React, strict TypeScript, Vite, Tailwind, ESLint, Prettier and test tooling configured.
- GitHub Pages-compatible base path; local development entry point.
- Verification: dependency installation completed; Vite production build and ESLint passed.
- Local development server returned HTTP 200. Git initialized on `main`; no remote configured.

## Phase 2 — catalog and discovery

- Runtime-validated OpenRouter adapter, per-token price normalization, malformed-record isolation, missing/dynamic prices, source links and per-session timestamps.
- Search, combined hard filters, pagination, cost/input/output/newest/context rankings and transparent scenario rules.
- Explicit browser load, local import, six-hour visible-tab refresh, stale/error retention and Retry-After backoff. No server mirror or catalog commit.
- Official API observed with HTTP 200, CORS `*`, 452 records on initial investigation. API authentication documentation and observed anonymous behavior differ; no secrets used.
- Validation: parser/filter tests passed; terms and redistribution limits recorded for conservative architecture.

## Phase 3 — calculator

- Workload inputs, cache-read calculation, request fees, context/output checks, daily/monthly/yearly costs and lower-cost alternatives.
- Tested independent examples: $900/month without caching; $787.50/month with 50% cache at the test rates.
- Validation: 59 unit/component tests passed across five files, including cost, parser, filters, shares and localized form controls.

## Phase 4 — comparison and visualization

- Three-model shortlist, side-by-side table, grouped token-price bars, monthly bars, price scatter, accessible data table and validated share links.
- Clipboard failure fallback, missing shared models and no fabricated history or capability scores.
- Build and ESLint passed after fixing a JSX delimiter in the insights page.

## Phase 5 — responsive UI and accessibility

- Dark/light themes, English/Chinese, responsive navigation, keyboard dialog, loading skeletons and reduced-motion rules.
- Browser QA uses installed Microsoft Edge when the Playwright Chromium download is unavailable. CI uses downloaded Chromium.
- Fixed light-theme contrast and non-color link affordances based on axe failures.
- Converted mobile table rows into compact labeled layouts after browser tests exposed scroll/click failures.
- All 28 desktop/mobile E2E tests passed, including axe checks of discovery, calculator and comparison in both themes.
- Captured real direct-API screenshots with 452 validated models and no page errors; manually inspected desktop, comparison, light and mobile layouts.

## Phase 6 — regression and deployment verification

- Extended regression cases for structured tier overrides, numeric overflow, non-text free classification and tiny positive price display.
- 64 unit/component tests passed; independent GitHub Pages subpath production smoke check passed.
- Upgraded Vitest/coverage to 5.0.5 and ESLint to 10.14.0; documented the minimatch 11 override. Final install/audit: zero reported vulnerabilities across 322 packages. Latest-tooling lint and all 64 unit/component tests passed.
- Final E2E rerun after dependency upgrades: 28/28 passed, including both themes and viewport projects.

## Phase 7 — release packaging

- English/Chinese READMEs, MIT scope, contribution/conduct/security policies, changelog and templates created.
- CI and deployment check lint/tests/browser flows and build; opt-in six-hour health check writes metadata artifacts only.
- All three workflow files parsed as valid YAML. No remote repository, push, or deployment has been performed.
- Added a detailed verification record with real test counts, source-check evidence, failures/fixes and local browser/network limitations.
- Initially retained the original workspace when the chat directory changed. On the user's subsequent explicit instruction, moved the complete repository and its sibling `.tooling` directory to `D:\OneDrive\Documents\ChatGPT\My GitHub`. File inventories and sizes matched before and after the move; the original project and tooling directories are absent. Existing mathematics materials were preserved.
- Final production-subpath check and local documentation-link checks passed; staged implementation and test changes were saved in local Git commits. Formatting and whitespace checks passed before release packaging.
- After relocation, production build and all 64 unit/component tests passed again; `git fsck --full` passed. No project references were found in the remaining mathematics files.

## Release-readiness engineering review — 2026-11-01

- Reviewed data/cost boundaries, all pages and interactions, privacy, keyboard accessibility, lazy charts, workflow permissions and documentation.
- Fixed import/refresh concurrency, whole-workspace timer rerenders, price/fee underflow and display precision, tablet overflow, import provenance, incomplete calculator selection and inaccessible filtered chart totals.
- New share links use URL fragments, with same-tab restoration and legacy-query compatibility. Added no-referrer policy, localized titles, explicit input validity and keyboard-scrollable data regions.
- Final checks: 94 unit/component tests passed; 72 E2E tests passed across exact 375px, 768px and 1440px widths; all-five-page dark/light axe scans passed. Cost lines 100%, lib lines 93.19%.
- Production build and Pages subpath smoke passed. Live source check: 452 models, zero rejected. Full dependency audit: zero reported vulnerabilities.
- Added `docs/ENGINEERING_REVIEW.zh-CN.md` and four explicitly synthetic review screenshots. Public source permissions, real hosted deployment, Safari/Firefox/physical devices and human screen-reader validation remain external release gates. No remote push or deployment performed.

## Open-source launch preparation — 2026-11-01

- Rewrote English/Chinese READMEs with a short value proposition, immediate Quick Start, first-use flow, real captures and explicit current limits. Added setup/troubleshooting and a separate formula/architecture reference.
- Refreshed and inspected six real API screenshots; provided a 90-second recording guide without claiming a generated video/GIF.
- Prepared Description/Topics, v0.1.0 release notes, Reddit/V2EX drafts, an HN author brief respecting its generated-text rule, three scoped good-first-issue drafts and a complete Pages launch/rollback checklist.
- Aligned package/lockfile/security/changelog to the requested first public version 0.1.0; the prior 1.0.0 marker was local and unpublished. No tag was created.
- Restored standard MIT license text; documented separate data/media/dependency rights. Generated complete license/NOTICE texts for 50 locked production entries and added stale/version/license checks to CI and Pages. No runtime dependency was added or upgraded.
- Lint, 94 tests, root production build, Pages browser smoke and license asset checks passed. Stale-notice failure injection rejected altered output and passed after byte-for-byte restoration. Current audit reported zero vulnerabilities. Full 72-case E2E and coverage figures remain the separately dated engineering-review evidence.
- `docs/launch/VALIDATION.md` distinguishes new checks, prior evidence and external gaps. No remote push, external post, GitHub issue, release or deployment was performed.
