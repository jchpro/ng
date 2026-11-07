# ngx-kit implementation notes

Things that aren't obvious from the code, moved out of CLAUDE.md. Per-feature usage lives in `projects/@jchpro/ngx-kit/docs/`.

- **Auth views** (local auth only; `ngx-kit/docs/auth.md`): `KitLogin`, `KitForgotPassword`, `KitSetPassword` (`flow="reset" | "invite"`) on
  `KitAuthCard`, `KitPasswordToggle` and `KitIcon`. The kit does no auth itself: views emit `submitted`/`requested`, the app makes the
  request and feeds `busy`/`error` back; no router, no `@angular/forms`. While `busy` the submit button spins and fields turn
  read-only (not a card scrim, which would drop focus). Open work: #49, #50, #51, #52.
- CDK overlays (menus, dialogs) need `@jchpro/ngx-kit/styles/overlay` included once in the app's
  global styles — nothing else provides the overlay container CSS now that Material is gone.
- `--kit-prose-*` type tokens (doc-style headings) are the `prose-h2`/`prose-h3`
  heading styles; use them only directly under the page title, never inside a panel/card that has its own
  `app-h2`/`app-h3` title. Prose stops at h3, so there is no prose h1 or h4–h6.
- `.kit-prose` (`styles/_prose.scss`, in `primitives`) applies the prose tokens to the plain, unclassed
  elements of a container, plus links, blockquote, inline code and tables; `.kit-table-frame` is the optional
  table wrapper (frame + horizontal scroll). docs-app's content area uses it (`@extend`ed onto
  `.kit-shell__content`). Elements not styled yet are listed on the docs-app Typography page. See `ngx-kit/docs/prose.md`.
- Contrast: use `--kit-border-control` (never `--kit-border-subtle`) for the edge of a control,
  `--kit-status-*-ink` for status as text (the plain `--kit-status-*` are fills/icons), and
  `--kit-ink-on-primary` for the primary button label. `npm run check:contrast` (part of `npm test`) prints the
  ratio of every pairing from `_tokens.scss` and fails on one under its threshold, minus documented exceptions.
  Invalid state: `aria-invalid="true"` / `:user-invalid` (never `:invalid`), message line `kit-field__error`.
- **Data tables** (`ngx-kit/docs/table.md`, docs-app Tables page): your own typed `<table class="kit-table">`
  with `@for` inside the layout-only `KitDataTable` frame (slots by attribute, loading/empty/error states), `th[kitSort]`
  headers, `KitPaginator`, `.kit-badge`, cell classes `kit-cell--*`. `kitTableState()` holds query/filters/sort/page as
  signals (`page` is a `linkedSignal` that resets to 1 when the others change) with `params` for a `resource()`; given to
  `<kit-data-table [state]>`, `input[kitSearch]`, `[kitFilter]`, `th[kitSort]` and `kit-paginator` bind to it by DI on the frame.
  `urlSync` (opt-in) mirrors it in the query string via `Router`; it tells its own navigation echoes from outside ones
  (`kit-table-url-sync.ts`). Phase 3 extras: `kitTableSelection` (keys, cleared by search/filter changes), `KitPopover` (CDK
  connected overlay; the filters panel and column picker use it because a menu closes after every item), `kitTableColumns` + `kitCol`
  (the `hidden` attribute), `kit-density-toggle`, `kitClientTable` / `applyKitTableParams`, row expansion (`kitTableExpansion`, `kit-expand-toggle`, and `td[kitDetail]`, which
  sets its `colSpan` from the shown header cells and re-runs when `columns` changes). A projected `@if` suppresses a slot's fallback content, so `kitTableEmpty` must be unconditional.
  Reading `resource.value()` throws in the error state: use `hasValue()`. `.kit-badge` is primary ink on a tint with a
  status-colored dot, since `status-*-ink` text on its own tint fails 4.5:1 (the contrast script checks tinted pairs with
  `status-x@10>surface-raised` backgrounds).
- **Batch 2** (kit 0.6.0–0.7.0, issues #31–#39):
  `.kit-tabs` (nav of links, `aria-current="page"`), `--kit-surface-sunken`, `.kit-check__note` and `[kitCheckGroup]`
  (checkboxes bound to an array, any writable signal incl. a Signal Forms `value`), `kit-color-field` (a `FormValueControl<string | null>`),
  `.kit-chips`/`.kit-chip` and `kit-chip-input` (a `FormValueControl<string[]>` that trims and drops empties and leaves duplicates and limits to the form's validators), `kitTiles`/`kitTile` (CDK `CdkListbox`/`CdkOption` hostDirectives, `[(value)]`; arrows
  follow the reading order), `kit-dropzone` + `kitDropzone` (files in the input, `(files)`/`(rejected)`), `KitToastService`
  (errors sticky, `provideKitToasts`, first toast shows 50 ms late so the live regions are in the page). The CDK key manager reads
  `keyCode`, so specs that dispatch keys must set it, and a CDK option takes `id` over (use `data-*` in specs).
