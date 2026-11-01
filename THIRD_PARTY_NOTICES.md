# Third-party rights and notices

The [MIT license](LICENSE) covers original ModelValue Radar code and original documentation. It does **not** grant rights to third-party model metadata, names, marks, screenshots of source data, benchmark datasets or dependency code. This file records engineering decisions, not a legal opinion or a grant from a data provider.

## Dependency code

Dependencies keep their own copyright and license terms. The checked-in [license and NOTICE text](public/third-party-licenses.txt) is copied from the installed production entries in `package-lock.json` and is also served at `<site base>/third-party-licenses.txt`. This conservative set includes shared/type-only peer entries; it is not an exact bundle inventory. Vite copies this public file into every production build.

The current direct runtime dependencies declare MIT except `class-variance-authority` (Apache-2.0) and `lucide-react` (ISC). Transitive packages also include ISC, BSD-3-Clause and combined license declarations; their original notices are retained. Development tools have separate licenses, including Apache-2.0 and MPL-2.0; installing a development tool does not relicense the project. Check their package files if redistributing the tools themselves.

After any dependency change:

```bash
npm ci
npm run licenses:generate
npm run licenses:check
```

Review the generated diff, including any `NOTICE` files. CI and Pages builds fail if the snapshot is stale, a locked production package is not installed at the expected version, or license text cannot be found. A string such as `MIT` in package metadata is not a substitute for reading applicable terms. No new dependency was added to generate this inventory.

## Model data and brand names

The app can read the documented [OpenRouter models API](https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties). Successful API access does not establish an unrestricted data license. See [OpenRouter terms](https://openrouter.ai/terms) and our [data policy](docs/DATA_POLICY.md). No blanket permission to mirror, cache or redistribute the full catalog has been established in this project.

- No full production catalog is bundled, committed or mirrored; imports and live catalogs stay in browser memory.
- Automatic Actions source checking remains disabled until the maintainer reviews permission and enables it. An explicit source load is not itself a substitute for permission to operate a public integration.
- Provider/model names identify the compared entries; they do not imply endorsement. No provider logos were downloaded for the UI; avatars use text initials.
- No benchmark dataset or historical price dataset is included.

## Screenshots and recordings

[Product screenshots](docs/screenshots/README.md) contain a dated view of real source metadata, so third-party rights still apply. They are not wholly relicensed by MIT and are not evidence of current prices or permission to advertise provider marks. [Engineering screenshots](docs/review/README.md) use clearly marked synthetic test records and must not be presented as real model prices.

Before public launch or using images in promotion, review the intended display/screenshot use with the source's terms and any permission obtained. If that use is not permitted or remains unresolved, omit the affected media/integration until resolved; do not replace it with invented prices. Record the reviewer, date, scope and evidence in the [launch checklist](docs/launch/GITHUB_PAGES_CHECKLIST.md).
