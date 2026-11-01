# Clear the focused model search with Escape

Labels: `good first issue`, `help wanted`, `enhancement`

## Why / 为什么

Explore has a controlled search input but no explicit Escape-to-clear shortcut. Keyboard users should be able to clear a nonempty query without selecting and deleting its text, while keeping their other filters.

中文：在发现页搜索框内按 Escape 清空搜索，保留焦点与其他筛选条件。不要做全局快捷键，也不要影响弹窗的 Escape 关闭行为。

## Reproduce and entry points

Start in `src/pages/Explore.tsx`. Type a query that narrows the catalog, keep focus in the search input, and press Escape. The current application has no explicit handler for this behavior. See `tests/e2e/` for deterministic catalog fixtures, search/filter helpers and viewport projects.

## Proposed scope

- Handle Escape on the search input only, when the query is nonempty. Use the existing filter-update path so pagination resets to page one.
- Retain focus in that input. Preserve provider, scenario, price, modality and parameter filters.
- Do not intercept Escape elsewhere, add a document listener or alter comparison/dialog state. Other keys keep normal input behavior.

## Acceptance criteria

- [ ] A matching query narrows results; Escape clears it and restores the results allowed by remaining filters.
- [ ] Focus stays in the search input and pagination is reset appropriately.
- [ ] The test explicitly selects at least one other filter and verifies it survives.
- [ ] Escape with an empty query has no unrelated effects; the details dialog still closes with Escape.
- [ ] Behavior works in both languages and the browser viewport projects; tests use fixtures, not the live API.

Add one focused E2E regression and run `npm run test:e2e` plus the contribution guide checks. Out of scope: global shortcuts, fuzzy search, URL-persisted filters or new search dependencies.
