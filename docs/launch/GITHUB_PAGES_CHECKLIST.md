# GitHub Pages launch checklist / 上线检查清单

This is an operator checklist, not a claim that launch has occurred. **No remote repository, remote workflow run, Pages deployment, tag, release, issue or community post has been created by this delivery.** Local evidence is in the [engineering review](../ENGINEERING_REVIEW.zh-CN.md) and [launch validation](VALIDATION.md). Check an item only after verifying it for the actual release commit.

## 0. Record the intended release

| Record                                                     | Value to complete                                       |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| Owner / repository                                         | Pending; intended repository name `modelvalue-radar`    |
| `REPO_URL`                                                 | Pending actual public repository                        |
| `DEMO_URL`                                                 | Pending successful Pages deployment                     |
| Source commit / release tag                                | Pending verified commit / proposed `v0.1.0`             |
| Data/display permission reviewer, date, evidence and scope | Pending; do not infer permission from API accessibility |
| Code push / site publication approval                      | Pending owner confirmation                              |
| Release / issue / community publication approvals          | Pending separately                                      |
| Last known good deployment / rollback commit               | None before first launch                                |

## 1. Rights and repository contents

- [ ] Review current [OpenRouter terms](https://openrouter.ai/terms), documented API conditions and any permission obtained for the **intended public integration and promotional screenshots**. Record evidence and restrictions above. No blanket catalog redistribution permission has been established. If use remains unresolved, withhold that integration/media until resolved; an API key or successful request does not grant rights.
- [ ] Keep full catalogs, local imports, credentials and private workloads out of Git and release assets. Use `git ls-files` and review the staged diff. Synthetic fixtures stay clearly labeled TEST ONLY and outside production imports.
- [ ] Confirm the standard [MIT LICENSE](../../LICENSE) applies to original code/docs only; preserve [third-party notices](../../THIRD_PARTY_NOTICES.md) and `public/third-party-licenses.txt` in distribution.
- [ ] Confirm `package.json` and root lock metadata both say `0.1.0`; review changelog, security policy and release draft. The older local `1.0.0` marker was unpublished; do not describe a nonexistent prior public release.
- [ ] Repository root contains `package.json`, `src/`, `public/` and `.github/`, not an extra nested project folder. Exclude parent `.tooling`, `node_modules`, `.env`, reports and `dist` from source commits according to `.gitignore`.
- [ ] Set a real private security-reporting path and conduct contact; do not invent an email address or promise a response SLA. Enable GitHub private vulnerability reporting if supported for the repository.

## 2. Verify the exact candidate commit locally

Use Node 24 with npm. Run from the project root after a clean dependency install:

```bash
npm ci
npm run licenses:check
npm run format:check
npm run lint
npm run test:coverage
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:build
```

- [ ] All required commands pass; save the commit ID, environment and results. Inspect failures instead of suppressing them. Edge is a local fallback through `PLAYWRIGHT_CHANNEL=msedge`; hosted CI installs Chromium.
- [ ] Review the 375px / 768px / 1440px projects, keyboard behavior and both themes/languages. Browser automation is not a substitute for a human screen-reader or physical-device check; record untested platforms honestly.
- [ ] `test:build` successfully loads production assets, lazy chunks, hash navigation, share state and dependency notices under `/modelvalue-radar/`. It uses test fixtures at the network boundary, not a bundled model dataset.
- [ ] Run `npm audit` and assess current advisories; a previously clean audit is not a permanent guarantee. Do not blindly run `npm audit fix --force`.
- [ ] Inspect real screenshots and their timestamp; omit outdated or unauthorized ones. No fake usage numbers, quality scores or pricing history in copy.

`test:build` leaves a subpath build in `dist`. Rebuild for the intended host before a separate manual deployment. `VITE_BASE_PATH=/` is for local root/custom-domain hosting; a project site typically needs `/modelvalue-radar/`. The Pages workflow obtains the path from GitHub automatically.

## 3. Create/configure the actual GitHub repository — owner action

- [ ] Obtain explicit approval to create/push the repository and publish the site. **A push to `main` triggers the existing deployment workflow** once Pages is configured; account for that before authorizing a push.
- [ ] Create or select the intended repository and verify its exact URL. Review remote destinations before pushing. No command in this local checklist has configured a remote for you.
- [ ] Verify GitHub plan and visibility support Pages. A public repository is the usual open-source route on GitHub Free. Review [Pages limits and acceptable use](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits); Pages is not a general commercial SaaS/e-commerce host. Keep this project within the host's current rules.
- [ ] Apply the reviewed [description/topics](REPOSITORY_METADATA.md); leave Website blank until the deployed URL is verified. `private: true` in package.json prevents accidental npm publication, not GitHub source visibility.
- [ ] Select **Settings → Pages → Build and deployment → Source: GitHub Actions**. Check the `github-pages` environment's allowed deployment branches/review settings; use `main` for this workflow.
- [ ] Confirm Actions are allowed by repository/organization policy. CI needs `contents: read`; Pages metadata lookup additionally needs `pages: read`; the deploy job needs `pages: write` and `id-token: write`. Do not grant broad write permissions to pull requests.
- [ ] Keep `ENABLE_CATALOG_CHECK` unset/false until source permission review is complete. No API secret is needed for the observed public endpoint. **Never put a key in `VITE_` variables.**
- [ ] Optional custom domain: verify ownership, configure DNS/CNAME correctly and wait for HTTPS before use. No domain purchase is required for the default Pages URL.

## 4. First hosted deployment

- [ ] After approval, publish the reviewed source to `main`; or manually run **Deploy GitHub Pages** on `main` once source already exists. The workflow deliberately skips other branches.
- [ ] Confirm CI and deployment build checks actually pass remotely. They include license checks, formatting, lint, tests, browser flows and build verification. Local Windows/Edge success does not certify Linux/Chromium CI.
- [ ] Confirm `actions/configure-pages` supplied the correct base, the final build used it, and the deploy job published that artifact to `github-pages`. Failed checks must stop deployment. Inspect retained browser artifacts on failure.
- [ ] Read the actual deployed URL from the workflow/environment; do not guess the owner, domain or path. Record the successful commit and run link.

## 5. Signed-out hosted smoke test

Open the real HTTPS URL in a fresh, signed-out browser context:

- [ ] App, favicon, scripts and CSS load; there are no asset 404s, uncaught errors or mixed-content errors. Check first render and a lazy-loaded chart page.
- [ ] Initial empty catalog is explained. Explicit official loading succeeds where upstream access is available; network failure produces an actionable error. Retrieval time is labeled correctly. No test catalog appears as production data.
- [ ] Search, scenario/provider filters, sorting and pagination behave together; a no-results state can be reset. Details open/close with keyboard.
- [ ] Calculator updates for changed workload; invalid inputs, unknown/free token rates and missing cache rates have the documented behavior. Use permitted data or clearly synthetic local fixtures only during QA, never in marketing.
- [ ] Add/remove up to three models, compare table/charts and copy results. Test clipboard denial fallback. A shared `#compare?s=...` URL restores in a new tab after data load; it must not be advertised as a historical price snapshot.
- [ ] Direct hash routes and refresh work at the actual project base, including a copied share URL. No server rewrite is required.
- [ ] Check 375px, 768px and 1440px, both languages and themes, visible keyboard focus and reduced motion. Record physical devices or assistive tools actually tested.
- [ ] Inspect network/storage: no analytics or inference calls; catalog stays in memory; only locale/theme persist. The source request still exposes normal connection metadata to its provider.
- [ ] Open `<actual site base>/third-party-licenses.txt`; confirm the text is present. Confirm the Open source link points to the real repository after its URL is configured (see below).

The app's current **Open source** button navigates to its Methodology page because no real repository URL is configured. Before launch, update that button in `src/App.tsx` to link to the verified repository URL. Preserve the existing footer link to Methodology. This edit must receive the normal build/browser verification; do not invent the destination now.

## 6. Optional six-hour source check

- [ ] Only after the recorded rights review, set repository **Actions variable** `ENABLE_CATALOG_CHECK=true`. This enables manual and scheduled checks; it is not a secret or frontend setting.
- [ ] Manually run **Catalog health check (opt-in)**; inspect its `data-check.json` artifact for status, counts, timestamps and error reporting. Confirm no catalog payload or credentials are saved.
- [ ] Confirm the UTC schedule `17 */6 * * *` is understood: scheduled execution can be delayed/disabled by GitHub. The artifact expires after 30 days. No commits, model mirror or site rebuild occurs.
- [ ] Do not present the check's time as the browser's retrieval time or a price-change date. Browser refresh is separately six-hour/visible-tab and retains last successful data on failure; local imports are not overwritten.
- [ ] Record who will monitor failures. Disable the repository variable if access terms change or repeated failures need investigation; do not remove throttling or add frontend credentials.

## 7. Documentation, release and outreach

- [ ] Put the actual working demo URL in both READMEs and repository Website. Replace the local-only status once it is factually outdated. Adjust the Quick Start text that currently says no remote is configured.
- [ ] Remove `REPO_URL`/`DEMO_URL` tokens from any text to be published. Keep draft instructions in repository documents clearly separate from published release text. Only enable badges when they target real workflows/releases.
- [ ] Recheck the final diff and approvals. Tag the verified commit `v0.1.0` only after explicit authorization, then create the release using [these notes](../releases/v0.1.0.md). Consider marking this early version as a prerelease; confirm that choice with the owner. Source archives are sufficient; do not attach model datasets.
- [ ] With separate permission, create the [three starter issues](../good-first-issues/README.md) and labels, then replace draft references with real issue links. Confirm each task remains unimplemented/unassigned.
- [ ] Review the [community materials](COMMUNITY_POSTS.md) per platform. HN requires the author to write their own text; its section is a fact brief. Check current community rules and obtain explicit posting approval. No mass posting or vote solicitation.

## 8. Failure and rollback

- [ ] If first deployment fails, retain local access and inspect workflow logs; do not announce a working demo. Correct permissions/base/failed checks and retry a reviewed commit on `main`.
- [ ] After a later regression, reproduce it, identify the last known good commit and prepare a focused revert/fix. Review and approve that new commit, then push it to `main` for the normal checks/deployment. This workflow cannot deploy an arbitrary non-main branch just by selecting it.
- [ ] Avoid force-pushing shared history or bypassing failing checks. A failed new deployment should not be described as a successful rollback; verify the live site's actual result.
- [ ] If data access fails, show the existing error/stale state and permitted local import option. Do not solve it by silently shipping a copied catalog. Document upstream incidents without private user data.
- [ ] After recovery, repeat the hosted smoke test, record the new run/commit and update release notes only if user-visible behavior changed.

中文验收原则：本地测试通过、代码获准推送、网站上线验证、Release 发布以及社区发帖是不同步骤。逐项记录实际证据，未完成项保持未勾选；不要把这个清单本身当作“已经上线”。
