# Data provenance and implementation decision

Reviewed during implementation on **2026-11-01**. This is a record of engineering constraints, not a legal interpretation or a grant of rights.

Rechecked during the release-readiness review on the same date: the official terms page identifies its last update as August 31, 2026; no blanket model-directory redistribution grant was established. A new metadata-only health check passed with 452 models and zero rejected records. Current API documentation says the default response selects text-output models; the app describes and filters the returned catalog, not an exhaustive inventory of every modality on the service.

## Sources reviewed

- [Official model endpoint reference](https://openrouter.ai/docs/api/api-reference/models/get-models)
- [Model overview and pricing fields](https://openrouter.ai/docs/guides/overview/models)
- [Limits / error handling](https://openrouter.ai/docs/api-reference/limits)
- [OpenRouter Terms of Service](https://openrouter.ai/terms)
- Live `GET https://openrouter.ai/api/v1/models`, read for schema and connectivity verification only.

The endpoint returned HTTP 200 without credentials and advertised CORS `*` in the local investigation. A later browser verification parsed 452 records. These observations are dated, not hard-coded product promises. The reference includes bearer authentication; if anonymous access stops, this app fails clearly rather than exposing a secret.

The terms page reviewed restricts copying/scraping and reserves rights in service materials, including compiled data (sections 7 and 12). Documentation of an API does not by itself establish an unconditional right to republish its complete output. No clear blanket redistribution/caching grant was established. The implementation therefore avoids shipping a complete catalog, retaining a server-side copy, scheduled data commits, or exporting the catalog. Before publicly operating this integration, the maintainer should resolve applicable display/use permissions with the source as necessary. No scraping or model inference is implemented.

## Scope of the adapter

`DataProvider.load()` returns validated `Catalog` records. Zod validates the envelope and identifying/capability fields. Price values are separately normalized: strings or numbers become finite nonnegative USD/token values; sentinel `-1`, empty strings, malformed values and missing values become `null`, never free. Unknown pricing structures (including `overrides` arrays) do not discard otherwise usable models; additional fields are flagged as exclusions.

Invalid records and duplicate IDs are skipped with a visible count. If no valid record remains, the fetch/import fails. The source adapter currently asks for the unpaginated endpoint without parameters; if a future response starts paginating by default, extend the adapter with bounded documented pagination rather than silently assuming completeness. Source fields unrelated to this product are not included in the normalized model.

| Raw field                            | Meaning in this app                                                        |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `id`, `name`                         | Exact model identity, rendered as escaped text.                            |
| ID prefix                            | Model-author label; not an endpoint provider guarantee.                    |
| `context_length`                     | Advertised context limit; unknown stays unknown.                           |
| `top_provider.max_completion_tokens` | Advertised maximum output, if known.                                       |
| `architecture.*_modalities`          | Hard-filter support declarations.                                          |
| `supported_parameters`               | Advertised API parameters, not benchmark results.                          |
| `pricing.prompt`, `completion`       | USD/token, converted to USD/1M for display.                                |
| `pricing.input_cache_read`           | Cache-read USD/token, if known.                                            |
| `pricing.request`                    | Known per-request charge. Missing is explicitly assumed zero in estimates. |
| Other pricing keys                   | Excluded charges/overrides; they are not evaluated as a tier engine.       |
| `created`                            | Catalog-entry timestamp used for newest sorting, not price changes.        |
| App `fetchedAt`                      | Successful receipt/import in this browser, not upstream update time.       |

## Request rate and retention

No endpoint-specific numerical quota for unauthenticated catalog requests was established from the reviewed limits page. Free-model **inference** quotas are not asserted to be catalog quotas. The browser uses an explicit initial request, one-minute manual cooldown, and six-hour refresh while visible. HTTP 429 honors `Retry-After` (seconds or date). Fetches time out and no concurrent fetch is started. A failed refresh leaves the previous catalog intact and displays a warning.

No backend, storage bucket, analytics, key or persistent full-catalog cache is used. The current tab holds normalized data in memory. Reloading clears it. Local storage contains only language/theme. Imports are capped at 10 MB, processed locally and marked as unverified source age; no import file is committed or uploaded. Source links generated for compatible imports remain OpenRouter links, so imported content is not thereby authenticated by OpenRouter.

## Scheduled checks

`check-data.yml` is disabled unless `ENABLE_CATALOG_CHECK=true`. It makes one validation request per enabled run and saves metadata only: status, counts, timestamp or failure reason. Six-hour scheduling and manual dispatch are supported. A failed run exits nonzero and still uploads its report. Earlier successful Actions runs remain the record of prior successful checks. Neither successful nor failed checks alter a deployed site, publish prices or commit a directory.

Browser freshness and Actions check history are separate. A green scheduled check does not prove a visitor's tab has refreshed. There is no second-by-second market feed claim and no synthetic price history.

Imports and API refreshes now share one concurrency lock. Imports show a busy state, cannot race a refresh, and never trigger scheduled replacement. Countdown rendering is local to the status component, so it does not redraw the entire catalog and charts each second. New comparison URLs place workload in a fragment; older query links are still parsed. No-referrer is set both in the document and the API request.

## Non-text and advanced charges

The calculator estimates a text-input/text-output workload. Modality filters can identify image-capable candidates, but image processing, media output, tool use, cache writes and provider-specific tiers are not modeled. A multimodal model's text-token rates are not the total cost of a multimodal application. This limitation is shown in the calculator and comparison. Structured override fields are flagged, not flattened.

## License boundaries and future data

MIT applies to original code/documentation, not provider data, brands or future third-party benchmarks. UI screenshots contain a small, dated view of factual source metadata for product documentation; no underlying catalog is shipped. Synthetic test models are labeled `TEST ONLY` and never imported into production UI.

To add a snapshot provider: document explicit permission, attribution, allowed fields, retention, update cadence, schema version, source timestamp semantics, atomic validation/publication and last-good fallback. To add benchmarks: document benchmark name, metric, version, methodology and display rights. To add history: retain genuine permitted observations with source and date; never interpolate invented history into observed data.
