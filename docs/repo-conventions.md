# Repo conventions (maintainer notes)

Moved out of CLAUDE.md; the short rules stay there.

- **Versioning**: pre-1.0, so breaking changes to any `@jchpro/*` package can be a minor bump. Libraries version independently (tags `common-vX.Y.Z` /
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

- **docs-app code highlighting**: the highlight.js themes (`github`, `github-dark`) are SCSS partials in
  `docs/code-example/hljs/` that wrap the package's CSS in a `theme` mixin, `@use`d by `code-example.scss` (the package files are
  meant for `@import`, which Sass deprecates). They are generated: after upgrading `highlight.js` run
  `npm run generate:hljs-themes` and commit; `npm run check:hljs-themes` (in `npm test`) fails when they have drifted.

- **Readme size**: once a package readme grows large, split feature-specific content into
  `docs/*.md` files (see `ngx-kit/docs/`) and link back — verify the split files are actually
  included in the packaged output and that relative links between them still resolve.
