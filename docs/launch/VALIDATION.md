# Launch preparation validation — 2026-11-01

Scope: README/onboarding, launch drafts, screenshot evidence, dependency notices, CI checks and first-public-version metadata. Baseline commit: `a9c77de`. No runtime application feature was changed in this task; the three proposed beginner improvements remain unimplemented.

Environment: Windows, Node 24.22.1, npm 11.6.2, installed Microsoft Edge 156. The workspace lacks npm on PATH, so actual npm commands used `node ../.tooling/package/bin/npm-cli.js`. That local helper is not part of the repository and is not needed by normal Node/npm installations. Browser smoke used `PLAYWRIGHT_CHANNEL=msedge`.

## Executed in this launch-preparation pass

| Check                                          | Observed result                                                                                                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                                 | Passed, zero warnings                                                                                                                                      |
| `npm test`                                     | 94 tests in 7 files passed                                                                                                                                 |
| `npm run build`                                | TypeScript and production Vite build passed                                                                                                                |
| `npm run licenses:generate` / `licenses:check` | Generated and verified notices for 50 locked production entries, including shared/type-only peers; not an exact bundle count                               |
| Stale-notice failure injection                 | Appended a temporary marker, confirmed check fails with the expected stale-notice error, restored original bytes in `finally`, then confirmed check passes |
| `npm run test:build`                           | Real browser production smoke passed at `/modelvalue-radar/`: assets, lazy charts, share restoration, navigation/reload, no page/HTTP errors               |
| Added production license assertion             | HTTP 200 and text/plain; expected Recharts/CVA license and NOTICE content is present at the Pages subpath                                                  |
| `npm audit --audit-level=low`                  | Zero reported vulnerabilities at check time; not a future security guarantee                                                                               |
| `npm run screenshots`                          | Six real API captures, no browser page errors; 452 matching records observed, no catalog file saved                                                        |
| Visual review                                  | Opened all six actual screenshot files and inspected desktop dark/light, comparison/calculator and Chinese/mobile layouts                                  |

Documentation verification also passed: 124 local Markdown file/heading references across 28 documents, consistent `0.1.0` package/lock versions, Prettier formatting, and Git whitespace checks. The three workflows parsed with the installed Prettier YAML parser; this checks syntax, not GitHub execution. Whitespace checks found extra blank lines at the ends of LICENSE and the newly staged notice inventory; the license and inventory generator were corrected.

The two known Rollup warnings about the position of Zod's `@__PURE__` annotations remain nonfatal; the build removes those comments. No dependency version changed in this task. A new clean `npm ci` was not repeated here; earlier installation validation is recorded separately. License inventory/version checks operated against the installed locked packages.

Capture provenance: [2026-11-01T12:15:55.258Z, direct browser source load](../screenshots/README.md). Screenshots contain source metadata, not product traction or guaranteed current prices. No video or GIF was generated; [recording guidance](MEDIA_GUIDE.md) is supplied instead.

## Prior engineering evidence, not rerun here

The [engineering review](../ENGINEERING_REVIEW.zh-CN.md) records 72/72 browser test cases (24 flows at three viewport widths), all-five-page dark/light axe checks, cost line coverage 100% and core-lib line coverage 93.19%. This launch pass reran the 94 tests and the relevant production browser smoke; it did **not** rerun the full 72-case suite or coverage. Report those figures with that distinction.

## Not established locally

- A real GitHub repository URL, hosted Linux/Chromium workflow success, public Pages URL, tag or Release. No remote or tag is configured.
- Permission from OpenRouter to redistribute its full catalog, or a final public-integration/promotional-image clearance. Source access alone is not a grant; the opt-in scheduled check remains off by default.
- Published community posts or GitHub issues. The HN deliverable is a fact brief because its guidelines require author-written posts. Reddit/V2EX copy remains editable local drafts.
- Safari, Firefox, physical devices or a human screen-reader audit. Automated checks are not universal accessibility certification.
- A live destination for the app's Open source button, which currently navigates to Methodology. The final repository-link edit and hosted recheck are explicit items in the launch checklist.

Use the [launch checklist](GITHUB_PAGES_CHECKLIST.md) for the remaining owner-dependent steps. The repository license is standard MIT for original work, with separate third-party texts and data/media scope. This is an engineering inventory, not legal clearance.
