# Associate workload input hints with aria-describedby

Labels: `good first issue`, `help wanted`, `accessibility`

## Why / 为什么

`WorkloadForm` currently places its explanatory `<small>` text inside each label. The inputs have accessible names, but no distinct accessible description. Associate each hint with its input so assistive technology can expose the field name and instruction separately.

中文：让工作负载输入框的说明成为可被读屏软件读取的独立描述，保持可见标签、原有输入行为和双语文案。

## Reproduce and entry points

Open Calculator and inspect a numeric input's accessibility properties. There is no `aria-describedby` reference. Start in `src/components/WorkloadForm.tsx` and `src/components/WorkloadForm.test.tsx`; locale setup is already demonstrated there.

## Proposed scope

- Use React `useId` to create instance-safe hint IDs for the five number inputs and cache slider. Do not use random IDs or hard-code IDs that collide when two forms render.
- Keep the visible field title as its label. Associate the existing hint with `aria-describedby`; move hint markup outside the label if needed to keep it out of the accessible name.
- Preserve validation, percentage conversion, reset behavior and both languages. No new dependency is needed.

## Acceptance criteria

- [ ] Every workload control has its correct label and a separate accessible description.
- [ ] English and Chinese descriptions match the visible hint text.
- [ ] Rendering two forms produces no duplicate hint IDs and each input points to its own hint.
- [ ] RTL assertions use `toHaveAccessibleDescription`; existing blank-input/cache/reset tests still pass.
- [ ] Tab order, keyboard editing and 375px layout remain usable.

Validation: `npm test -- src/components/WorkloadForm.test.tsx`, then the checks in `CONTRIBUTING.md`. A real screen-reader spot check is welcome, but do not claim it happened unless it did. Out of scope: changing cost math, validation ranges, the visual form design or global focus behavior.
