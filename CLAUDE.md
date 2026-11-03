# @jchpro/ng — working notes for Claude

Angular monorepo of `@jchpro/*` libraries, maintained solo by Jakub (publishes to npm himself;
consumed by five repos: `ngx-common` by bookshelf, garden, landing, auth and babyroom, `ngx-kit` by auth and babyroom). See [conventions.md](conventions.md) for coding rules — read that
file too, it's not duplicated here.

<!-- overseer:begin id=ng hash=17efe828 -->
<!-- Managed by the overseer repo. Do not edit between the markers; change the rules there. -->

## CI and Actions minutes

The account's free Actions minutes are limited. Private repos spend them; public repos are exempt.

- Private repos run CI on pull requests, not on pushes to the default branch, and not on `develop` pushes. A weekly scheduled run is fine.
- Skip docs-only changes (`paths-ignore`) and cancel superseded runs (`concurrency`).
- Batch work into fewer pull requests, and run lint, type-check, tests and the build locally before pushing.
- A repo that deviates from this says why in its CLAUDE.md.

## Git

- Work on a branch. Never push to the default branch unless asked.
- Commit on your branch without asking: small commits, one concern each, with a short, to-the-point message. Reference the issue (`#123`) when there is one. Push only when asked.
- Opening a PR needs a yes in the current session. Never merge and never enable auto-merge unless asked.
- Never force-push (branches or tags) unless explicitly asked in the current session. Never rewrite shared history.
- Check `git status` before committing; do not commit unrelated changes or secrets.
- Deploys, releases and publishing happen through GitHub Actions, and only when asked.

## Issues and other repos

- Work is tracked in GitHub issues; open work does not live in CLAUDE.md or TODO files. Reference the issue in commits and PRs.
- Ask before creating an issue.
- Do not change other repos from here; read them only to look things up. A change needed elsewhere (library change, deploy, infra) becomes an issue there, drafted for the owner to approve.
- Use labels `overseer:blocked`, `overseer:needs-release`, `overseer:needs-deploy` to signal cross-repo state.
- Cross-repo dependencies go in the issue body as a fenced YAML block (`depends-on: owner/repo#12`, `next: deploy`).

## Language

- Chat, code, comments, commits and issues are in English.
- User-facing text follows each app's own languages, which may be one or several.

## Privacy and secrets

- Never commit, log or paste secrets, tokens, keys or `.env` contents. Real values live in the password manager or on the server.
- Real user or customer data may exist only as a local copy, never the live system. Never commit it, never put it in tracked fixtures, issues, PRs, commits or logs, and never point dev or test at production. You may run against the copy but must not dump or quote records in the session; use counts, shapes or invented examples.
- A customer may be referred to by first name only.
- Use anonymised sample data in tests and fixtures.

## Servers and background processes

- A server or process you started for your own checks: stop it before you finish.
- One the owner asked you to start: leave it running until told to stop, and say what is running (what and which port) when you finish a task.

## Quality

- Run the repo's tests and linter before saying work is done; report failures plainly instead of hiding them.
- Match the surrounding code's style, naming and comment density.
- Keep changes scoped to what was asked. Mention, but do not silently fix, unrelated problems.

## Context: library

Public libraries consumed by other repos (e.g. Nest and Angular libs).

- Semver. From 1.0 a breaking change is a major bump, with a migration note in the changelog. Before 1.0 a breaking change may be a minor.
- Every user-facing change needs a changelog entry and an updated README/docs. When the version is bumped (with the change, or at release) is the repo's own convention, written in its CLAUDE.md; follow it.
- Never publish, tag or release unless explicitly asked in the session. Releases are cut deliberately (owner confirms).
- Publishing is done by Actions (tag-triggered, npm trusted publishing), not from a laptop. A repo that publishes differently records the exception and its reason in the registry.
- Before a breaking change, check `uses:` in the registry for consumers and open a bump issue in each (ask first, as for any issue).
- Nothing private, internal or customer-related in what gets published (package contents, docs, changelog) or in a public repo's code, issues and commits.
- After a release, dependent repos get a bump issue (labels: `overseer:needs-release` on the lib until published).

<!-- overseer:end -->

## Stack

Angular 22, zoneless (`provideZonelessChangeDetection()`), standalone components (the default,
no `standalone: true` needed), built with `ng-packagr`. TypeScript strict mode.

## Repo layout

- `projects/@jchpro/ngx-common` — framework-agnostic utility lib (i18n, storage, reactivity,
  routing, browser tokens). Stable, pre-dates the current rewrite.
- `projects/@jchpro/ngx-kit` — **the active project.** Admin-app UI kit (layout shell, form
  primitives, theming, soon a login view) styled with the jchPRO "App" surface.
  Replaces the old `@jchpro/ngx-admin`/`@jchpro/ngx-material` (dropped entirely in the 2026-09
  rewrite — no Material, no bundled i18n library, CDK-only for behavior).
- `projects/docs-app` — consumer/demo app, served at `npm start`, deployed to
  https://ng.jchpro.pl. Also doubles as the realistic "does this actually work" testbed for
  `ngx-kit` before anything ships.

Root `package.json` has per-project `build:*`/`watch:*`/`test:*` scripts (see that file) — use
`npm run watch:kit:dev` while iterating on the library so `dist/@jchpro/ngx-kit` stays fresh for
`docs-app`'s TS `paths` mapping to pick up.

## Visual language

`ngx-kit` follows the jchPRO look, App surface only — never Marketing/skew styling. The layout
shell and login are designed directly in code, informed by the token rules below.

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

**Override pattern** (`KitIcon`, the `[kitIcon="slot"]` marker; implemented in `KitPasswordToggle`
only so far, the shell header's mobile toggle is the next candidate): a content-projection slot for components that render a built-in icon but should let a consumer swap it for
literally anything (a different icon library, inline SVG, emoji) — not a plain token swap, which
is enough when the only need is picking a different icon from Lucide itself:
```html
@if (customIcon()) {
  <ng-content select="[kitIcon=slotname]"></ng-content>
} @else {
  <svg lucideDefaultIcon></svg>
}
```
with `contentChildren(KitIcon, { descendants: false })` checked for the slot name (`icon.slot()`)
detecting whether anything was projected. A projected `@if` block only matches `select` when it
has a single root element. Reserve this for spots where a different icon *source* is plausible, not every icon.

## i18n

`ngx-kit` stays framework-agnostic — **no transloco or any i18n library dependency, not even a
peer dep.** Every user-facing string (visible text and aria-labels) goes through a
per-feature `InjectionToken<Signal<T>>` (e.g. `KIT_SHELL_LABELS`) with English defaults baked in,
plus a `provideKitXLabels(labels | Signal<labels>)` override function. The override is a deep
*partial* merged over the English defaults (so overriding one string doesn't need the rest),
and a complete set such as the PL one is just a full partial. Each feature also ships a
`KIT_X_LABELS_EN`/`KIT_X_LABELS_PL` constant (typed against the same interface, so TS catches
field drift), plus one root-level `provideKitLabels('en' | 'pl' | Signal<'en' | 'pl'>)` convenience wiring every
feature at once (a signal follows a language that changes at runtime, a factory run in an injection context reads it from a service: `KitLabelsSource`) — add each new feature to it. Per-call/per-instance options layer on top of the
injected default (closest wins: defaults < app-wide < call). V1 is flat strings only — no
rich-content projection slots inside labels (add per component later if a real need comes up).
Implemented for dialogs (`KIT_DIALOG_LABELS`), the forms parts (`KIT_FORM_LABELS`, the messages of `KitFieldError` and the texts of `kit-color-field`), the toasts (`KIT_TOAST_LABELS`), the shell (`KIT_SHELL_LABELS`, the sidenav
toggle's aria-label) and the auth views (one `KIT_AUTH_LABELS` with nested groups; two messages use
named `{min}`/`{identifier}` placeholders, so "flat strings" now means plain strings); the merge/provider logic is shared in `src/lib/labels/kit-labels.ts`
(`provideKitLabelsFor`), so a new feature's labels are a token + defaults + one-line provider.
Documented in `docs/labels.md`.

## Secondary entry points and optional peers

`@jchpro/ngx-kit/testing` (`projects/@jchpro/ngx-kit/testing/`, specs run via the `include` in `angular.json`) holds the test helpers
(`settle`, `openMenu`, `type`, `pick`, `submit`): no Jasmine types or APIs in it, and the main entry never imports it. The `@angular/forms`
peer is optional: only `KitFieldError` / `resetKitForm` use it, as types (`FieldTree`), so keep them `import type`.

## Project conventions specific to this repo

- **Changelog**: accumulate everything under one `## [X.Y.Z] - Unreleased` entry per package —
  don't bump the version number or add a new dated entry per work session. Bump only at an
  actual release.
- **Versioning**: pre-1.0, so breaking changes to any `@jchpro/*` package can be a minor bump, but
  every breaking release opens bump issues in the consumer repos (ask first). Libraries version independently (tags `common-vX.Y.Z` /
  `kit-vX.Y.Z`; full guide in [releasing.md](releasing.md)). To release: add a `## [X.Y.Z] - Unreleased` changelog heading, then
  `npm run release -- ship <common|kit> <X.Y.Z>` (needs `gh`: branch, PR, waits for checks, merges,
  tags, asks before pushing the tag), or by hand `prepare` → PR → merge → `tag <lib>` on an
  up-to-date `main` → push the tag. `npm run check:versions`
  (in `npm test`) guards drift, including kit's peer range on common. That range is the **lowest common the kit works with, then each later
  minor** (`^0.8.0 || ^0.9.0`), not the current version: the release tool only appends a clause for a new minor of common and never raises
  the floor (raise it by hand when kit needs newer API). So an additive change to common is a patch (no kit release); a minor is for breaking.
- **`box-sizing` in kit CSS**: a rule that sets a size (`width`, `max-height`…) together with padding or a border sets
  `box-sizing: border-box` itself. The docs-app has a global reset, so a miss only shows in apps without one (menu items overflowed
  their panel, #24). `npm run check:box-sizing` (part of `npm test`) compiles the styles and fails on a rule without it; the few
  deliberate exceptions are listed in the script with their reason.
- **Readme size**: once a package readme grows large, split feature-specific content into
  `docs/*.md` files (see `ngx-kit/docs/`) and link back — verify the split files are actually
  included in the packaged output and that relative links between them still resolve.
- **Keep the docs-app Kit pages in sync**: when a change adds, removes or renames an `ngx-kit`
  capability, update its docs-app page (`projects/docs-app/src/app/kit/<feature>/`) in the same
  change. The Kit pages are **grouped**: a sidebar page (Foundations, Layout, Forms, Feedback, Tables, Auth) holds
  the sections of its area as router-driven tabs (`kit-tabs`, `DocsTabbedPage`, `tabs` on `DocPage` in `kit/docs.ts`),
  folders `kit/<group>/<tab>/`. A new capability is a **tab in the group it belongs to**, not a new sidebar page; a
  new group only when none fits. The **Common** pages work the same way: Internationalization and Storage stay single pages,
  Components & directives (`common/components/<tab>/`) and Browser & routing (`common/browser/<tab>/`) hold their features as tabs, so a new
  `ngx-common` service or directive is a tab there. The Shell tab (`kit/layout/shell/`) has a setup walkthrough (examples live in
  `projects/docs-app/public/code/kit-shell/`) and a components table — new shell components or
  setup steps belong there, alongside the library's own `docs/*.md` and changelog. A tab follows the Shell tab's
  shape: short overview, setup with code examples, components list. Keep these pages short.
- **docs-app polish**: its current look is a deliberate placeholder (post-Material, pre-ngx-kit
  styling in spots not yet migrated) — don't proactively "fix" visual rough edges there unless
  asked; it'll be revisited once more of `ngx-kit` exists.
- **docs-app code highlighting**: the highlight.js themes (`github`, `github-dark`) are SCSS partials in
  `docs/code-example/hljs/` that wrap the package's CSS in a `theme` mixin, `@use`d by `code-example.scss` (the package files are
  meant for `@import`, which Sass deprecates). They are generated: after upgrading `highlight.js` run
  `npm run generate:hljs-themes` and commit; `npm run check:hljs-themes` (in `npm test`) fails when they have drifted.
- **`main`**: protected, but Jakub can bypass it. Code and CI changes go through a PR so the PR check runs and the docs-app
  auto-deploy (every push to `main`) never ships untested code; docs-only changes too (see Git above). Releases never need a
  bypass. Ask before pushing a release tag.
- **npm publish workflows**: `publish-common.yaml` / `publish-kit.yaml` publish with npm OIDC
  trusted publishing (`id-token: write`, no `NPM_TOKEN`) on a `common-v*` / `kit-v*` tag only —
  deliberately no `workflow_dispatch`, so a branch can't publish. The trusted publisher is bound to
  the workflow *file name* on npmjs.com, so renaming either file breaks publishing.

## Current state (as of 2026-10-07)

Phases: 0 scaffold ✅, 1 tokens/theme ✅, 2 primitives ✅, 3 layout shell ✅, 4 auth views ✅
(merged in #17, kit 0.2.0 released), 5 (applied to docs-app) ✅, Font Awesome → Lucide
migration ✅. **Phase 4 (auth views, local auth only)**: `KitLogin`, `KitForgotPassword`, `KitSetPassword` (`flow="reset" | "invite"`)
built on `KitAuthCard`, `KitPasswordToggle` and `KitIcon` (the first real use of the `kitIcon` slot pattern
above, implemented as an attribute-marker directive), documented in `docs/auth.md` and the docs-app Auth
page. The kit does no auth itself: views emit `submitted`/`requested`, the app makes the request and feeds
`busy`/`error` back; no router, no `@angular/forms`. While `busy` the submit button spins and fields turn
read-only (not a card scrim, which would drop focus). Left for later: MFA, registration without an invite,
per-field server errors on `KitSetPassword`.

"Batch 1" of admin-app building blocks is done, each with docs (`ngx-kit/docs/*.md`) and a
docs-app page: loading state (`kitBusy`, global shell bar), menus (CDK menu wrappers), page
header (classes), dialogs (`KitDialogService`, Promise-based `alert`/`confirm`/`open`, labels).
Notes that aren't obvious from the code:
- CDK overlays (menus, dialogs) need `@jchpro/ngx-kit/styles/overlay` included once in the app's
  global styles — nothing else provides the overlay container CSS now that Material is gone.
- `--kit-prose-*` type tokens (doc-style headings) are the `prose-h2`/`prose-h3`
  heading styles; use them only directly under the page title, never inside a panel/card that has its own
  `app-h2`/`app-h3` title. Prose stops at h3, so there is no prose h1 or h4–h6.
- `.kit-prose` (`styles/_prose.scss`, in `primitives`) applies the prose tokens to the plain, unclassed
  elements of a container, plus links, blockquote, inline code and tables; `.kit-table-frame` is the optional
  table wrapper (frame + horizontal scroll). docs-app's content area uses it (`@extend`ed onto
  `.kit-shell__content`). Elements not styled yet are listed on the docs-app Typography page. See `docs/prose.md`.
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
- **Batch 2** (kit 0.6.0 released, issues #31–#39; the `kit-chip-input` of #36 is on `feat/kit-chip-input`, for 0.7.0):
  `.kit-tabs` (nav of links, `aria-current="page"`), `--kit-surface-sunken`, `.kit-check__note` and `[kitCheckGroup]`
  (checkboxes bound to an array, any writable signal incl. a Signal Forms `value`), `kit-color-field` (a `FormValueControl<string | null>`),
  `.kit-chips`/`.kit-chip` and `kit-chip-input` (kit 0.7.0, a `FormValueControl<string[]>` that trims and drops empties and leaves duplicates and limits to the form's validators), `kitTiles`/`kitTile` (CDK `CdkListbox`/`CdkOption` hostDirectives, `[(value)]`; arrows
  follow the reading order), `kit-dropzone` + `kitDropzone` (files in the input, `(files)`/`(rejected)`), `KitToastService`
  (errors sticky, `provideKitToasts`, first toast shows 50 ms late so the live regions are in the page). The CDK key manager reads
  `keyCode`, so specs that dispatch keys must set it, and a CDK option takes `id` over (use `data-*` in specs).
- docs-app's `.claude/launch.json` serves on 4300 (4200 is taken by other repos' dev servers); if something else holds that
  port, preview on a different one with a temporary launch config rather than reusing it.
