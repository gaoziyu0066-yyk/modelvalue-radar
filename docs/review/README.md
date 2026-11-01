# Engineering-review screenshots

Captured on 2026-11-01 from the actual local app using Playwright and installed Microsoft Edge.

**All data in these review screenshots is synthetic `TEST ONLY` fixture data injected by tests. These are interaction/layout verification captures, not real model prices or a production data snapshot.** The product itself does not ship these fixtures.

- `1440-compare-dark.png`: 1440 × 1000 CSS viewport, dark comparison.
- `768-compare-dark.png`: 768 × 1024 CSS viewport, dark comparison.
- `375-compare-light-zh.png`: 375 × 812 CSS viewport, light Chinese comparison, device pixel ratio 2.625.
- `768-extreme-calculator.png`: 768 × 1024 CSS viewport, long imported name and deliberately extreme but valid workload; huge amount explicitly approximate.

These are full-page captures, so image height exceeds viewport height. Tests also verify all five pages in both themes and keyboard scrolling in wide tables. See [the review report](../ENGINEERING_REVIEW.zh-CN.md) for scope and limitations. Earlier [product screenshots](../screenshots/README.md) have separate live-source provenance.
