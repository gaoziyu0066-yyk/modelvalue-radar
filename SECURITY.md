# Security policy

The current development target is the 0.1.x release line; v0.1.0 is prepared locally and not yet published. This is a static frontend with no login, secrets, database, server-side catalog mirror or inference calls.

## Reporting

Use **Security → Report a vulnerability** in the GitHub repository if private vulnerability reporting is enabled. Before the first public release, the owner should enable this feature in repository settings. If it is unavailable, use a private contact published on the owner's profile; if none exists, open an issue asking for a private reporting channel **without exploit details or secrets**. No private reporting address has been invented for this project.

Include the affected version, impact, reproducible steps and a minimal proof of concept. Do not upload a user's workload, credentials or third-party catalogs. Maintainers will acknowledge and triage reports as their availability permits; no response-time guarantee is offered.

## Boundaries

- Imported JSON is limited to 10 MB and runtime validated. Names render as React text, not HTML. External source links are built under the fixed OpenRouter origin.
- Share URLs are versioned, size-limited, bounded to three IDs, and validated before use. They disclose selected model IDs and workload quantities to recipients; do not put sensitive quantities into public links.
- New share state is fragment-only, avoiding hosting query logs. Legacy query URLs still restore and may already have been logged by a host; recipients/browser history can see either format. Page and API requests use a no-referrer policy.
- Metadata arrays are bounded and deduplicated. Nonzero decimal strings that underflow, and prices whose per-million conversion overflows, become unknown rather than free or infinite chart values. No raw HTML is rendered from imports.
- Browser local storage contains language and theme only. Catalogs remain in memory. The source API still receives connection metadata from direct requests.
- `VITE_` variables are public. Never add API keys. If the API starts requiring authentication, keep the error/manual-import fallback or design a separately reviewed server integration.
- Actions use read-only repository permission except the dedicated Pages deployment job. Pull requests must not execute with repository secrets. Catalog checking is opt-in and does not write to the repository.
- Dependency changes should run the full check suite. Review Dependabot updates; an automated scanner is not a security guarantee.

## Development dependency override

`package.json` overrides transitive `minimatch` to `^11.0.3` to avoid the globparts amplification advisory affecting earlier versions. Current ESLint/config-array/typescript-eslint consumers use the named API; lint and the test suite are verified with this override. Review and remove it once upstream dependency ranges include a fixed major. Vitest and its coverage adapter are upgraded together to the patched 5.x release line. Never run an unattended `npm audit fix --force` that downgrades unrelated tooling.

Price-data inaccuracies are normally data-quality issues, not security vulnerabilities. Report them with source URLs, units and retrieval times.
