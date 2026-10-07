# @jchpro/ng — working notes for Claude

Angular monorepo of `@jchpro/*` libraries, maintained solo by Jakub (publishes to npm himself,
no external consumers yet). See [conventions.md](conventions.md) for coding rules — read that
file too, it's not duplicated here.

## Stack

Angular 22, zoneless (`provideZonelessChangeDetection()`), standalone components (the default,
no `standalone: true` needed), built with `ng-packagr`. TypeScript strict mode.

## Repo layout

- `projects/@jchpro/ngx-common` — framework-agnostic utility lib (i18n, storage, reactivity,
  routing, browser tokens). Stable, pre-dates the current rewrite.
- `projects/@jchpro/ngx-kit` — **the active project.** Admin-app UI kit (layout shell, form
  primitives, theming, soon a login view) styled with the jchPRO design system's "App" surface.
  Replaces the old `@jchpro/ngx-admin`/`@jchpro/ngx-material` (dropped entirely in the 2026-09
  rewrite — no Material, no bundled i18n library, CDK-only for behavior).
- `projects/docs-app` — consumer/demo app, served at `npm start`, deployed to
  https://ng.jchpro.pl. Also doubles as the realistic "does this actually work" testbed for
  `ngx-kit` before anything ships.

Root `package.json` has per-project `build:*`/`watch:*`/`test:*` scripts (see that file) — use
`npm run watch:kit:dev` while iterating on the library so `dist/@jchpro/ngx-kit` stays fresh for
`docs-app`'s TS `paths` mapping to pick up.

## Design system

jchPRO design system — a Claude Artifact Jakub maintains — is the source of truth for
`ngx-kit`'s visual language. It currently only specs Button/Card/Field in detail; layout shell
and login were designed directly in code (informed by the token rules) and should be
backfilled into the artifact later, not the other way around. Ask Jakub for the current URL if
you need to check it — don't assume it's unchanged from an old memory note.

Only the **App surface** matters here, never Marketing/skew styling.

Tokens are CSS custom properties prefixed `--kit-*` (color, type, spacing, radius, shadow,
control-height), shipped via `@jchpro/ngx-kit/styles/tokens` and consumed with
`@use '@jchpro/ngx-kit/styles/x'; @include x.root-styles();` / `.classes()` mixins, exposed
through package.json's `exports` map under the `sass` condition.

**Token-usage rule learned the hard way**: brand color tokens like `--kit-brand-violet-muted`
are calibrated as *fill* colors (paired with `--kit-ink-on-accent` text), not as freestanding
text color — using one as text-on-surface can fail WCAG contrast in dark mode even though it
looks fine in light mode. Check actual contrast before using a brand/accent token as text color;
prefer a background tint + `--kit-ink-primary` text for "active/selected" states instead.

## Architecture rule: class vs. component (ngx-kit)

Hybrid, decided deliberately:
- **CSS classes on native elements** for simple presentational pieces (Button, Field, Card,
  status dot).
- **Real CDK-backed Angular components** only when there's actual stateful behavior
  (focus/keyboard/overlay/responsive collapse), compound multi-part structure, or a non-standard
  control a native element can't express. This graduation rule is intentionally left room for
  future compound/non-standard form controls (comboboxes, pickers, etc.), not just the layout
  shell.

## Theming

`KitThemeService` — tri-state scheme `'system' | 'dark' | 'light'`, defaults to `'system'`.
`'system'` resolves via pure CSS (`@media (prefers-color-scheme: light)` inside a `.kit-system`
class) so it tracks OS changes with no JS re-application; an `effectiveScheme` signal (CDK
`BreakpointObserver`) is also exposed for JS consumers that need to know the resolved scheme
(e.g. swapping a syntax-highlighter theme). `toggle()` cycles system → dark → light → system.

## Layout shell

`KitShell` / `KitShellHeader` / `KitShellSidenav` / `KitShellFooter`, state in `KitShellState`
(provided per shell instance, not root). Responsive breakpoint via CDK `BreakpointObserver`,
configurable through `KIT_SHELL_MOBILE_QUERY` (default 768px): docked sidenav above it, a
focus-trapped overlay with scrim below it. All shell layout CSS lives in **one** global
stylesheet (`styles/_shell.scss`), not per-component Angular-encapsulated styles — it targets
`.kit-shell-root kit-shell` using tag selectors, since the components style their own host
directly rather than wrapping content in extra divs. `KitShellRoot` (a `hostDirectives` marker on
the app root) is required for that selector to match; `KitShell` warns to the console if it's
missing. See [docs/layout.md](projects/@jchpro/ngx-kit/docs/layout.md) for full usage and the
sticky-header technique (`height: 100dvh` cap + flex scroll regions, not `position: fixed`).

## Icons

`@lucide/angular` (peer dependency of `ngx-kit`) — decided and migrated 2026-09-24, replacing
Font Awesome entirely (repo-wide, not just the library). Static icons: `<svg lucideGlobe>` +
import the class into `imports`. Data-driven icons (icon chosen at runtime, e.g. from a config
object): `<svg [lucideIcon]="value">` + `LucideDynamicIcon` in `imports`, where `value` is the
imported icon *class* (type `LucideIcon`) — no `provideLucideIcons()` registry needed unless
looking icons up by string name. `size` is a raw CSS length (not Font Awesome's `"2x"` tokens)
and defaults to a fixed 24px; `docs-app` sets `provideLucideConfig({ size: '1em' })` so icons
scale with surrounding text.

**Planned override pattern (not yet implemented anywhere)**: a content-projection slot, working
name `kitIcon`, for components that render a built-in icon but should let a consumer swap it for
literally anything (a different icon library, inline SVG, emoji) — not a plain token swap, which
is enough when the only need is picking a different icon from Lucide itself:
```html
@if (customIcon()) {
  <ng-content select="[kitIcon=slotname]"></ng-content>
} @else {
  <svg lucideDefaultIcon></svg>
}
```
with `customIcon = contentChild(KitIcon, { descendants: false })` detecting whether anything was
projected. Reserve this for spots where a different icon *source* is plausible, not every icon.

## i18n

`ngx-kit` stays framework-agnostic — **no transloco or any i18n library dependency, not even a
peer dep.** Every user-facing string (visible text and aria-labels) goes through a
per-feature `InjectionToken<Signal<T>>` (e.g. `KIT_SHELL_LABELS`) with English defaults baked in,
plus a `provideKitXLabels(labels | Signal<labels>)` override function. The override is a deep
*partial* merged over the English defaults (so overriding one string doesn't need the rest),
and a complete set such as the PL one is just a full partial. Each feature also ships a
`KIT_X_LABELS_EN`/`KIT_X_LABELS_PL` constant (typed against the same interface, so TS catches
field drift), plus one root-level `provideKitLabels('en' | 'pl')` convenience wiring every
feature at once — add each new feature to it. Per-call/per-instance options layer on top of the
injected default (closest wins: defaults < app-wide < call). V1 is flat strings only — no
rich-content projection slots inside labels (add per component later if a real need comes up).
Implemented for dialogs (`KIT_DIALOG_LABELS`) and the shell (`KIT_SHELL_LABELS`, the sidenav
toggle's aria-label); the merge/provider logic is shared in `src/lib/labels/kit-labels.ts`
(`provideKitLabelsFor`), so a new feature's labels are a token + defaults + one-line provider.
Documented in `docs/labels.md`.

## Project conventions specific to this repo

- **Changelog**: accumulate everything under one `## [X.Y.Z] - Unreleased` entry per package —
  don't bump the version number or add a new dated entry per work session. Bump only at an
  actual release.
- **Versioning**: pre-1.0, so breaking changes to any `@jchpro/*` package can be a minor bump —
  there are no real external consumers yet.
- **Readme size**: once a package readme grows large, split feature-specific content into
  `docs/*.md` files (see `ngx-kit/docs/`) and link back — verify the split files are actually
  included in the packaged output and that relative links between them still resolve.
- **Keep the docs-app Kit pages in sync**: when a change adds, removes or renames an `ngx-kit`
  capability, update its docs-app page (`projects/docs-app/src/app/kit/<feature>/`) in the same
  change. The Shell page (`kit/shell/`) has a setup walkthrough (examples live in
  `projects/docs-app/public/code/kit-shell/`) and a components table — new shell components or
  setup steps belong there, alongside the library's own `docs/*.md` and changelog. Features
  without a page yet get one (and a `kit/docs.ts` entry), following the Shell page's shape:
  short overview, setup with code examples, components list. Keep these pages short.
- **docs-app polish**: its current look is a deliberate placeholder (post-Material, pre-ngx-kit
  styling in spots not yet migrated) — don't proactively "fix" visual rough edges there unless
  asked; it'll be revisited once more of `ngx-kit` exists.
- **npm publish workflow**: the staged-publish step in `.github/workflows/publish-common.yaml`
  using a restricted token is intentional, not a bug — don't "simplify" it.

## Current state (as of 2026-10-06)

Phases: 0 scaffold ✅, 1 tokens/theme ✅, 2 primitives ✅, 3 layout shell ✅, 5 (applied to
docs-app) ✅, Font Awesome → Lucide migration ✅. **Phase 4 (login view) is paused** — don't
start it without Jakub re-initiating that work.

"Batch 1" of admin-app building blocks is done, each with docs (`ngx-kit/docs/*.md`) and a
docs-app page: loading state (`kitBusy`, global shell bar), menus (CDK menu wrappers), page
header (classes), dialogs (`KitDialogService`, Promise-based `alert`/`confirm`/`open`, labels).
Notes that aren't obvious from the code:
- CDK overlays (menus, dialogs) need `@jchpro/ngx-kit/styles/overlay` included once in the app's
  global styles — nothing else provides the overlay container CSS now that Material is gone.
- `--kit-prose-*` type tokens (doc-style headings) map the design system's `prose-h2`/`prose-h3`
  styles; use them only directly under the page title, never inside a panel/card that has its own
  `app-h2`/`app-h3` title. `--kit-prose-h1-*` is provisional, not in the design system yet (issue #10).
- `.kit-prose` (`styles/_prose.scss`, in `primitives`) applies the prose tokens to the plain, unclassed
  elements of a container, plus links, blockquote, inline code and tables; `.kit-table-frame` is the optional
  table wrapper (frame + horizontal scroll). docs-app's content area uses it (`@extend`ed onto
  `.kit-shell__content`). Elements not styled yet are listed on the docs-app Typography page. See `docs/prose.md`.
- docs-app's `.claude/launch.json` serves on 4200; if another project's dev server holds that
  port, preview on a different one with a temporary launch config rather than reusing it.
