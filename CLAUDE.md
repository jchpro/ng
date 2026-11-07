# @jchpro/ng — working notes for Claude

Angular monorepo of `@jchpro/*` libraries, maintained solo by Jakub (publishes to npm himself). See [conventions.md](conventions.md) for coding rules — read that
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
  primitives, theming, auth views) styled with the jchPRO "App" surface.
  Replaces the old `@jchpro/ngx-admin`/`@jchpro/ngx-material` (dropped entirely in the 2026-09
  rewrite — no Material, no bundled i18n library, CDK-only for behavior).
- `projects/docs-app` — consumer/demo app, served at `npm start`, deployed to
  https://ng.jchpro.pl (via `infra-vps`, see [deployment.md](deployment.md)). Also doubles as the realistic "does this actually work" testbed for
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

`@lucide/angular` (peer dependency of `ngx-kit`), no Font Awesome anywhere. Static: `<svg lucideGlobe>`; data-driven: `<svg [lucideIcon]="value">`.
Where a different icon *source* is plausible, a component offers the `[kitIcon="slot"]` projection slot (`KitIcon`; so far
`KitPasswordToggle`). Details and the slot pattern: [docs/icons.md](docs/icons.md).

## i18n

`ngx-kit` has **no i18n library dependency, not even a peer dep.** Every user-facing string (text and aria-labels) goes through a
per-feature `InjectionToken<Signal<T>>` (e.g. `KIT_SHELL_LABELS`) with English defaults, a `provideKitXLabels()` partial override,
`KIT_X_LABELS_EN`/`_PL` constants, and an entry in the root `provideKitLabels()` (a new feature must be added there). Shared logic:
`src/lib/labels/kit-labels.ts`. Full design: [docs/i18n.md](docs/i18n.md); usage: `ngx-kit/docs/labels.md`.

## Secondary entry points and optional peers

`@jchpro/ngx-kit/testing` (`projects/@jchpro/ngx-kit/testing/`, specs run via the `include` in `angular.json`) holds the test helpers
(`settle`, `openMenu`, `type`, `pick`, `submit`): no Jasmine types or APIs in it, and the main entry never imports it. The `@angular/forms`
peer is optional: only `KitFieldError` / `resetKitForm` use it, as types (`FieldTree`), so keep them `import type`.

## Project conventions specific to this repo

- **Changelog**: accumulate everything under one `## [X.Y.Z] - Unreleased` entry per package —
  don't bump the version number or add a new dated entry per work session. Bump only at an
  actual release.
- **Versioning**: pre-1.0, so a breaking change to any `@jchpro/*` package can be a minor bump. Libraries version independently (tags `common-vX.Y.Z` / `kit-vX.Y.Z`); release with `npm run release` (asks before pushing the tag), see [releasing.md](releasing.md). Kit's peer range on common is the *lowest compatible version, then each later minor*, not the current one; an additive change to common is a patch. More: [docs/repo-conventions.md](docs/repo-conventions.md).
- **`box-sizing`**: a kit CSS rule that sets a size together with padding or a border sets `box-sizing: border-box` itself (`npm run check:box-sizing` enforces it).
- **Readme size**: split large readmes into `docs/*.md`, then verify packaging and relative links.
- **Keep the docs-app Kit pages in sync**: a change to an `ngx-kit` or `ngx-common` capability updates its docs-app page in the same change. A new capability is a **tab in the group it belongs to**, not a new sidebar page. Keep these pages short. Structure: [docs/repo-conventions.md](docs/repo-conventions.md).
- **docs-app code highlighting**: the hljs theme SCSS is generated; after upgrading `highlight.js` run `npm run generate:hljs-themes` and commit (`check:hljs-themes` fails on drift).
- **`main`**: protected, but Jakub can bypass it. Code and CI changes go through a PR so the PR check runs and the docs-app
  auto-deploy (every push to `main`) never ships untested code; docs-only changes too (see Git above). Releases never need a
  bypass. Ask before pushing a release tag.
- **npm publish workflows**: `publish-common.yaml` / `publish-kit.yaml` publish with npm OIDC
  trusted publishing (`id-token: write`, no `NPM_TOKEN`) on a `common-v*` / `kit-v*` tag only —
  deliberately no `workflow_dispatch`, so a branch can't publish. The trusted publisher is bound to
  the workflow *file name* on npmjs.com, so renaming either file breaks publishing.

## Notes

Implementation notes that aren't obvious from the code (overlay styles, prose and contrast rules, data tables, CDK quirks) are in
[kit-notes.md](kit-notes.md). Open work is in GitHub issues.

- docs-app's `.claude/launch.json` serves on 4300 (4200 is taken by other repos' dev servers); if something else holds that
  port, preview on a different one with a temporary launch config rather than reusing it.
