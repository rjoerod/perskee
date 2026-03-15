# Migration Plan: Tailwind/Headless UI → CSS Modules/Radix UI

## Decisions

- **Scope**: Component by component, in dependency order
- **Combobox**: Custom component built on Radix Popover + controlled input
- **CSS Modules structure**: `shared.module.css` for `composes` + one `.module.css` per component
- **Visual fidelity**: 1:1 exact parity
- **Tailwind**: Runs via `@tailwindcss/vite` during migration; fully removed at end
- **Headless UI**: Fully removed at end
- **DRY strategy**: Cross-file `composes` from `shared.module.css`, same-file `composes` for variants, CSS custom properties for all shared values
- **Verification**: Dev server must work after every component

## Architecture

- `src/index.css` — `:root` CSS custom properties (design tokens) + global resets (Tailwind still imported until Phase 10)
- `src/styles/shared.module.css` — Shared composable classes (`badge`, `card`, `inputField`, `textSm`, etc.)
- `src/components/*/*.module.css` — Per-component styles, using `composes` from shared and same-file

## Progress

### Phase 0: CSS Infrastructure ✅

- [x] Moved Tailwind from `@tailwindcss/postcss` to `@tailwindcss/vite` (unblocks cross-file `composes`)
- [x] Added design token CSS custom properties to `src/index.css` `:root`
- [x] Created `src/styles/shared.module.css` with shared composable classes

### Phase 1: Primitive Components ✅

- [x] `Button.tsx` + `Button.module.css` — `composes: btnBase` from shared; size classes from shared `textSm`/`textBase`/etc.
- [x] `SingleInput.tsx` + `SingleInput.module.css`

### Phase 2: Sortable/Visual ✅

- [x] `SortableItem.tsx` + `SortableItem.module.css` — `data-points` attribute for story point color variants; `composes: badge` from shared; same-file composes for card/progress variants
- [x] `SortableContainer.tsx` + `SortableContainer.module.css` — same-file composes for container/items variants

### Phase 3: Layout & Navigation ✅

- [x] `Board.tsx` + `Board.module.scss`
- [x] `Boards.tsx` + `Boards.module.scss`
- [x] `Filters.tsx` + `Filters.module.scss`
- [x] `TaskFilters.tsx` + `TaskFilters.module.scss`

### Phase 4: Dropdown (Headless Menu → Radix DropdownMenu) ✅

- [x] `DropDown.tsx` + `DropDown.module.scss` — replace `@headlessui/react` Menu + Transition with `@radix-ui/react-dropdown-menu`

### Phase 5: Basic Modals (Headless Dialog → Radix Dialog) ✅

- [x] `ConfirmationModal.tsx` + `ConfirmationModal.module.scss` — replace Headless Dialog
- [x] `ModalButton.tsx` + `ModalButton.module.scss` — removed `idiotsAtHeadlessUI` workaround, replaced Tailwind classes
- [x] `TaskFiltersModal.tsx` + `TaskFiltersModal.module.scss` — replace Headless Dialog

### Phase 6: Modal Internals ✅

- [x] `ToastMessage.tsx` (minimal — already inline styles; fixed duplicate dismiss line)
- [x] `StoryPointsBadge.tsx` + `StoryPointsBadge.module.scss`
- [x] `ListBadge.tsx` + `ListBadge.module.scss`
- [x] `EpicTaskList.tsx` + `EpicTaskList.module.scss`
- [x] `MarkdownEditor.tsx` + `MarkdownEditor.module.scss` (replicated `@tailwindcss/typography` prose as plain CSS)
- [x] `DropZone.tsx` + `DropZone.module.scss`

### Phase 7: Custom Combobox + Epic Components (Headless Combobox+Popover → custom) ✅

- [x] Created `ComboboxPopover.tsx` + `ComboboxPopover.module.scss` — Radix Popover + controlled input + filtered list (self-contained open state, `extraOption` for "No Epic" sentinel)
- [x] `EpicBadge.tsx` + `EpicBadge.module.scss` — replaced Headless Combobox+Popover+wrapperRef with `ComboboxPopover`; removed `useEffect` click-outside logic
- [x] `EpicGenerateTasksButton.tsx` + `EpicGenerateTasksButton.module.scss` — replaced Headless Combobox+Popover with inline combobox (focus-driven dropdown, `onMouseDown` prevent-default to allow click before blur)

### Phase 8: Main Task Modal

- [ ] `TaskCardModal.tsx` + `TaskCardModal.module.css` — replace Headless Dialog with Radix Dialog (largest modal)

### Phase 9: Remaining

- [ ] `ContainerList.tsx` (mostly dnd-kit logic, minimal styling)
- [ ] `AddListButton.tsx`, `AddTaskButton.tsx` (thin wrappers, likely no CSS)

### Phase 10: Cleanup

- [ ] Remove `@import 'tailwindcss'`, `@plugin`, `@theme` from `src/index.css`
- [ ] Remove `@tailwindcss/vite` from `vite.config.ts`
- [ ] Empty or delete `postcss.config.js`
- [ ] Uninstall: `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/vite`, `@tailwindcss/typography`, `@headlessui/react`
- [ ] Refactor: convert inlined base styles to cross-file `composes` where beneficial
- [ ] Audit: grep `src/` for remaining Tailwind class names / Headless UI imports
- [ ] Verify: manual visual check of all views

## Design Tokens (CSS custom properties in `:root`)

| Variable | Value | Origin |
|---|---|---|
| `--c-bg-main` | `rgb(13, 17, 23)` | slate-950 / `--color-main` |
| `--c-bg-side` | `rgb(22, 27, 34)` | slate-900 / `--color-side` |
| `--c-bg-outline` | `rgb(33, 38, 45)` | slate-800 / `--color-outline` |
| `--c-bg-card` | `rgb(30, 41, 59)` | slate-800 |
| `--c-bg-card-alt` | `rgb(51, 65, 85)` | slate-700 |
| `--c-bg-card-hi` | `rgb(71, 85, 105)` | slate-600 |
| `--c-bg-input` | `rgb(17, 24, 39)` | gray-900 |
| `--c-bg-modal` | `rgb(31, 41, 55)` | gray-800 |
| `--c-text-primary` | `rgb(230, 237, 243)` | slate-200 |
| `--c-text-muted` | `rgb(203, 213, 225)` | slate-300 |
| `--c-text-dimmer` | `rgb(148, 163, 184)` | slate-400 |
| `--c-border` | `rgb(51, 65, 85)` | slate-700 |
| `--c-border-light` | `rgb(71, 85, 105)` | slate-600 |
| `--c-sky-500` | `rgb(14, 165, 233)` | sky-500 |
| `--c-sky-600` | `rgb(2, 132, 199)` | sky-600 |
| `--c-sky-700` | `rgb(3, 105, 161)` | sky-700 |
| `--c-indigo-400` | `rgb(129, 140, 248)` | indigo-400 |
| `--c-indigo-300` | `rgb(165, 180, 252)` | indigo-300 |
| `--c-violet-700` | `rgb(109, 40, 217)` | violet-700 |
| `--c-red-500` | `rgb(239, 68, 68)` | red-500 |
| `--c-green-500` | `rgb(34, 197, 94)` | green-500 |
| `--c-green-700` | `rgb(21, 128, 61)` | green-700 |
| `--c-green-800` | `rgb(22, 101, 52)` | green-800 |
| `--c-lime-700` | `rgb(77, 124, 15)` | lime-700 |
| `--c-yellow-700` | `rgb(161, 98, 7)` | yellow-700 |
| `--c-orange-700` | `rgb(194, 65, 12)` | orange-700 |
| `--c-emerald-700` | `rgb(4, 120, 87)` | emerald-700 |
| `--shadow-card-inset` | `inset 0 1px 0 0 #ffffff1a` | box-shadow-card |
| `--radius-card` | `0.5rem` | rounded-lg |
| `--radius-badge` | `0.125rem` | rounded-sm |
