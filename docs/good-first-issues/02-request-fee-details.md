# Show the known per-request fee in model details

Labels: `good first issue`, `help wanted`, `enhancement`

## Why / 为什么

The calculator already includes `model.pricing.request`, but the model details dialog only lists input, output and cache token prices. Exposing the request fee lets users inspect this part of the estimate without reading the source code.

中文：费用引擎已计算按次费用，详情弹窗还没展示。补上这一行，让用户明确区分“每次请求”和“每百万 Token”的价格单位。

## Reproduce and entry points

Open an entry's model details and inspect the price rows: there is no request-fee row. Start in `src/components/ModelDetails.tsx`; `src/types/model.ts` defines pricing, and `src/lib/utils.ts` provides `money`. Add focused component tests or a browser assertion using `src/test/fixtures.ts`/the existing E2E setup. Native dialog methods may need a small jsdom stub; existing browser tests already exercise the real dialog.

## Proposed scope

- Add a bilingual row such as **Request fee / USD per request** / **请求费用 / 美元每次**.
- Format known values with the existing money helper and enough precision for tiny positive fees; do not multiply this field by a million or use `tokenPrice`.
- Display an em dash or localized “Unknown” for `null`. A known zero must display as zero, not unknown. Keep the calculator's separate warning about assuming zero when the fee is unspecified.
- Use no new source fields, network requests or dependencies.

## Acceptance criteria

- [ ] Known positive, zero and unknown fees render distinctly in English and Chinese.
- [ ] A synthetic $0.001-per-request fee stays $0.001 per request; it never becomes $1,000.
- [ ] A tiny positive fixture does not round to a misleading zero.
- [ ] Details still close by keyboard; the added row fits mobile width.
- [ ] Existing calculator tests pass unchanged; no production catalog is checked in.

Run the focused tests plus the contribution guide checks. Out of scope: changing calculation rules, fee assumptions, taxes, provider routing or adding endpoint-specific price tiers.
