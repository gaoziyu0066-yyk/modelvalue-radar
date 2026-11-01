# Changelog

## Unreleased — engineering review, 2026-11-01

- Fix import/refresh races, timer-driven full-page rerenders, tiny-price underflow, per-million overflow and small nonzero currency display.
- Keep unverified import provenance and model-specific warnings in copied comparisons; add accessible shortlist costs independent of scatter filters.
- Use private-to-host URL fragments for new shares, preserve legacy links, restore same-tab shares, and suppress referrers.
- Fix tablet overflow and large-cost presentation; expose keyboard-scrollable tables, localized titles, route focus and field validity.
- Populate modality/parameter filters from actual catalog metadata and keep non-text/unknown-price models selectable with explicit reasons.
- Extend browser coverage to 375px, 768px and 1440px, all five pages in both themes, malicious imports, fragment privacy, extreme inputs and chart lazy loading.
- Add deployment failure artifacts, explicit Pages read permission for metadata lookup and a main-branch deployment guard.

## 1.0.0 — 2026-11-01

Initial local release; not yet published to a remote repository or live host.

- Model discovery with search, provider/modality/parameter/budget filters, pagination and transparent cost/context rankings.
- Runtime-validated OpenRouter provider, local JSON import, per-session retrieval timestamps, errors and stale-data warnings.
- Tested text-token calculator with caching, request charges, context checks, savings and explicit exclusions.
- Up to three models in a shared comparison, token-price bars, monthly-cost bars and price scatter.
- English/Chinese, dark/light, responsive mobile list, keyboard dialogs and reduced-motion behavior.
- Unit/component/browser test tooling, CI, Pages deployment configuration and opt-in six-hour API health checks.
- MIT project code; no fabricated benchmark scores, history, or bundled third-party catalog.
