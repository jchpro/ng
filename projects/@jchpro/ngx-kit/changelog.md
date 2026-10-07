# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased

### Added

- Initial package scaffold
- jchPRO App-surface design tokens (color, type, spacing, radius, shadow) as CSS custom properties, exposed via
  `@jchpro/ngx-kit/styles/tokens`
- `KitThemeService` — system/dark/light scheme toggling with persistence, defaulting to `system`; `effectiveScheme`
  tracks the OS preference live while `system`
- App Button, Field, Card, status-dot and breadcrumb primitives as CSS classes, exposed via
  `@jchpro/ngx-kit/styles/primitives` (or individually via `./styles/button`, `./styles/field`, `./styles/card`,
  `./styles/status-dot`, `./styles/breadcrumb`). Breadcrumb is deliberately not a component — apps build their own
  `<nav><ol class="kit-breadcrumb">` trail (deriving it from a route tree is app-specific), marking the final,
  non-link segment with `aria-current="page"`
- `KitShell`, `KitShellHeader`, `KitShellSidenav`, `KitShellFooter`, `KitShellRoot` and `KitShellState` — a
  responsive admin layout shell (docked sidenav on desktop, focus-trapped overlay below the configurable
  `KIT_SHELL_MOBILE_QUERY` breakpoint on mobile), composed at the app root; its layout CSS ships as one shared,
  global stylesheet (`@jchpro/ngx-kit/styles/shell`) rather than per-component styles, scoped under the
  `kit-shell-root` class `KitShellRoot` applies (`<kit-shell>` warns to the console if it can't find one above it).
  The header and footer stay pinned in view and only `.kit-shell__body` (sidenav/content) scrolls — `kit-shell`
  is capped at `height: 100dvh` rather than positioning the header itself, so there's no header-height value to
  keep in sync anywhere
- Split the readme into `docs/theming.md`, `docs/primitives.md` and `docs/layout.md`
- `@lucide/angular` peer dependency — the icon set for built-in component icons (currently the shell header's
  sidenav toggle)
- `KitShellNavSection` and `KitShellNavItem` for `kit-shell-sidenav` — a titled, optionally-disabled group of nav
  entries. `KitShellNavItem` renders nothing itself (link/disabled/icon inputs plus a `linkClick` output for
  link-less entries like logout); `KitShellNavSection` renders each item's `<a>`/`<button>`, icon and disabled
  state centrally, so apps only ever declare the items and their own active/disabled logic. `linkActiveOptions` is
  passed through to the link's `routerLinkActiveOptions` (e.g. `{ exact: true }`) in both the sidenav and the header
- Loading state, local and global — see `docs/loading.md`. `kitBusy` directive (`KitBusy`) puts a button into a
  spinner state (same width, click-swallowing but still focusable) or covers any other element with a scrim +
  spinner and makes it `inert`; `.kit-spinner` and `.kit-skeleton` classes, all via `@jchpro/ngx-kit/styles/loading`
  (also part of `primitives`). `KitLoadingService` (`begin()`, `track()`, `isLoading`) is a counter behind the global
  loading bar that `KitShell` now renders at the top edge of the viewport (`aria-busy` on its main area), shown
  after a 150 ms delay and kept at least 400 ms, tunable via `KIT_LOADING_OPTIONS`. Opt-in automatic sources:
  `kitLoadingInterceptor` for HTTP (skip a request with `KIT_LOADING_SKIP` / `kitLoadingSkipContext()`) and
  `provideKitNavigationLoading()` for router navigations. `.kit-btn` modifiers now set `--kit-btn-fg`, which the
  busy spinner reads
- Contextual menus — see `docs/menu.md`. `KitMenuTrigger` (`[kitMenuTriggerFor]`), `KitMenu` (`[kitMenu]`) and
  `KitMenuItem` (`[kitMenuItem]`, with `danger` and `[disabled]`, `[checked]`/`checkbox`) are host-directive wrappers over the CDK's
  `CdkMenuTrigger`/`CdkMenu`/`CdkMenuItem`, so keyboard handling, focus and ARIA come from the CDK; the kit adds the
  styling (`@jchpro/ngx-kit/styles/menu`, also part of `primitives`), a default below-the-trigger position with a
  gap, and swallows clicks on disabled items (the CDK alone doesn't stop the consumer's `(click)`). No submenus yet; `.kit-menu__label` gives a flat menu
  group headings.
  New `@jchpro/ngx-kit/styles/overlay` includes the CDK overlay container's structural CSS, which anything the kit
  opens in an overlay needs once in the app's global styles. `.kit-btn--icon` modifier for square icon-only buttons
- Page header — see `docs/page-header.md`. `.kit-page-header` and its `__breadcrumb`, `__title`, `__subtitle` and
  `__actions` parts (via `@jchpro/ngx-kit/styles/page-header`, also part of `primitives`): breadcrumb on top, the
  title with the page's main actions aligned to its right, optional subtitle; actions drop onto their own row below
  768px. `--sticky` modifier pins it inside the shell's content area. Plain classes, not a component, like the
  breadcrumb it hosts. New `.kit-btn--lg` size modifier for the headline action (`.kit-btn` height is now driven by
  `--kit-btn-height`, which `--icon` follows too)
- Dialogs — see `docs/dialogs.md`. One look for everything opened in a CDK `Dialog`: `.kit-dialog` with `__header`,
  `__icon`, `__title`, `__body`, `__footer` and per-tone modifiers, plus the `kit-dialog-panel--sm|md|lg` sizes and
  backdrop (`@jchpro/ngx-kit/styles/dialog`, also part of `primitives`); near full width on a phone. `KitDialogService`
  opens them and answers with Promises that never reject: `alert()` (`void`), `confirm()` (`true`, or `false` when
  cancelled *or dismissed*) and `open()` for your own component, which returns a `KitDialogRef` whose `result`
  resolves `undefined` when dismissed. Tones `info`, `success`, `warning`, `danger` (red confirm button, focus starts
  on Cancel, `alertdialog`) and `error`. `kitDialogTitle` (also the dialog's accessible name) and
  `[kitDialogClose]="value"` directives for your own dialogs. `.kit-btn--danger` button modifier
- Labels and translations: the dialogs' default titles and button labels live behind `KIT_DIALOG_LABELS`
  (`Signal<KitDialogLabels>`, English defaults), overridable app-wide with `provideKitDialogLabels()` (merged over
  the defaults, takes a value or a signal) and per call (`title`, `confirmLabel`, `cancelLabel`, `buttonLabel`).
  `KIT_DIALOG_LABELS_EN` / `KIT_DIALOG_LABELS_PL` complete sets, and `provideKitLabels('en' | 'pl')` as the one-call
  language switch for every feature of the kit. No i18n library dependency. The shell follows the same pattern:
  `KIT_SHELL_LABELS` / `provideKitShellLabels()` / `KIT_SHELL_LABELS_EN|PL` for the sidenav toggle's accessible name
  (previously a hardcoded English `aria-label`), plus a per-instance `toggleNavigationLabel` input on
  `KitShellHeader`. The merge and provider logic is shared (`mergeKitLabels`, `provideKitLabelsFor`, exported for
  building labels for your own components); see `docs/labels.md`
- Checkbox, radio and switch — `kit-check` (label) / `kit-check__input` (native input) classes, `kit-check-group`
  (`--inline`) for lists of them, via `@jchpro/ngx-kit/styles/check` (also part of `primitives`). A switch is a
  checkbox with `role="switch"`, so the ARIA role drives the look; indeterminate checkboxes are supported; unchecked
  outline is `--kit-ink-muted` for 3:1 contrast; forced-colors falls back to the native control
- Buttons: `.kit-btn` now works on every native button-like element — links (no underline, a link's own colors kept
  in every state, `aria-disabled="true"` as its `disabled`) and `<input type="button | submit | reset">` — and has
  hover and press states (the fill darkens, the ghost button tints violet; none while disabled). The modifiers now set
  `--kit-btn-bg`/`--kit-btn-fg`, and `.kit-btn` sets `box-sizing: border-box`. A busy `<input>` button keeps its label
  and is dimmed, as it can't draw the spinner. Fixed `kit-btn--icon` combined with `kit-btn--lg`, whose icon was
  squeezed by the large button's side padding
- Fieldset and legend — `kit-fieldset` / `kit-fieldset__legend` classes on the native elements (so the legend still
  names the group and `disabled` still disables its controls), via `@jchpro/ngx-kit/styles/fieldset` (also part of
  `primitives`). Bordered by default with the legend sitting in the border; `kit-fieldset--plain` drops the border and
  turns the legend into a heading. A grid with a gap, so contents are spaced without margins of their own
- Range, progress and meter — `kit-range`, `kit-progress` and `kit-meter` classes on the native elements, via
  `@jchpro/ngx-kit/styles/range` and `./styles/progress` (also part of `primitives`). The range's filled track is
  opt-in through a `--kit-range-fill` percentage (CSS can't read an input's value); progress is the violet fill with an
  indeterminate sweep when it has no value; a meter takes green, amber or red from the browser's low/high/optimum
  zones. Styled for both WebKit/Blink and Firefox pseudo-elements
- `.kit-field__control` now covers more native controls: `<input type="file">` (the native "choose file" button is
  styled to fit the field, inset 4px so its corners run concentric with the field's, tinted fill like the other
  selected states, vertically centered), `<textarea>` (as tall as its `rows`, vertical resize), `<select>` (the kit's
  chevron instead of the browser's arrow; a `multiple`/`size` list box shows selected options in the violet fill) and
  `<input type="color">` (a small rounded swatch). The control now sets `box-sizing: border-box`
- Prose type tokens (`--kit-prose-h2-*` 21/28/600, `--kit-prose-h3-*` 18/24/600) for long-form, documentation-style
  content, where the App scale's h2/h3 are too close to the body text. Mirror the design system's `prose-h2` /
  `prose-h3` styles (family stays Dosis via `--kit-font-display`)
- Prose styling — see `docs/prose.md`. `kit-prose` on a container styles its plain elements (`h1`–`h3` from the
  prose tokens, `p`, lists, links with a pink underline, `blockquote`, inline `code`, tables); everything sits in
  `:where()`/`:not([class])` so kit classes and your own always win. `kit-table-frame` is the optional wrapper that
  gives a table its rounded frame and horizontal scroll. New provisional tokens `--kit-prose-h1-*` (28/36/700). Part
  of `primitives`, or `@jchpro/ngx-kit/styles/prose` on its own
- Top navigation: `KitShellNavItem`s projected into `kit-shell-header` render as horizontal nav, inline while the
  sidenav is docked and moved to a second row below the header once it collapses to overlay — the same
  breakpoint as the sidenav itself. The nav row renders right after whatever's marked
  `kit-shell-header-leading` (typically a brand/logo) and before everything else projected in, so a trailing
  spacer + actions still end up pushed to the far end of the row. `kit-shell-header` grew an inner
  `.kit-shell-header__row` wrapper to support the second row; the header's own CSS otherwise renders identically
  to before for apps not using this
