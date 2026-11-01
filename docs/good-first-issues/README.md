# Good first issue drafts / 新手贡献任务

These are **local drafts**, not live GitHub issues. The maintainer can create them after publishing the repository and confirming issue publication. Check that each behavior is still missing before filing. Do not assign issue numbers or link to nonexistent issues.

| Draft                                                        | Useful outcome                                            | Scope                                     |
| ------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------- |
| [Accessible workload hints](01-accessible-workload-hints.md) | Screen readers receive separate input instructions        | One form and component tests              |
| [Request fee in model details](02-request-fee-details.md)    | Users can inspect a charge already used by the calculator | One details dialog and focused tests      |
| [Escape clears search](03-escape-clears-search.md)           | Keyboard users can reset only the active search           | One search control and browser regression |

Suggested labels: `good first issue`, `help wanted`, plus `accessibility` or `enhancement` as specified. These labels have not been created remotely. Each task has a small code entry point, observable behavior and acceptance tests; none requires API credentials, new infrastructure or changes to the cost formula.

Read [CONTRIBUTING](../../CONTRIBUTING.md) and [Quick Start](../QUICK_START.md). In a published issue, comment that you intend to work on it so others can coordinate; maintainer availability is not guaranteed. Draft PRs and English/Chinese questions are welcome. Tests use synthetic **TEST ONLY** fixtures, not copied live catalogs.

中文：三个任务是尚未实现的小功能，不是把已完成代码包装成任务。发布后可直接把对应文件的标题和正文整理进 Issue；开始前查看是否已有贡献者或 PR，避免重复劳动。
