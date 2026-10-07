# Roadmap / idea backlog

Not a commitment list — a parking lot for things worth doing eventually. Pull items into actual
work when there's time; delete or rewrite anything that stops being true.

## Next up

- **Phase 4 — login view.** The only remaining phase of the original `ngx-kit` plan. Paused
  deliberately after phase 3 so docs-app could be wired up first; design it directly in code,
  as the shell was, using the same labels-token i18n pattern.

## CI & releases

Target flow: PR → CI; a `<lib>-v*` tag → publish that library; every merge into `main` → redeploy
docs-app. Done in this order:

1. **Actions refresh** — `checkout`/`setup-node` v6 (v3 is a Node 16-era generation), `ubuntu-24.04`,
   `cache: npm`, `permissions: contents: read`, PR-workflow concurrency. Node is already 24 everywhere.
2. **Deploy on merge** — `example_app.yaml` is `workflow_dispatch` only today; add `push` to `main`
   plus a non-cancelling concurrency group. Optional: swap the bundle in with a `mv` instead of
   `rm -rf` + `cp`, which leaves a brief empty-site window.
3. **Version tooling** ✅ — independent per-library versions and `<lib>-vX.Y.Z` tags, handled by
   `scripts/release.mjs` (`prepare` sets the version, dates the `Unreleased` changelog heading and moves
   kit's `@jchpro/ngx-common` peer range when releasing common — on `0.x` a caret pins the minor;
   `tag` tags an up-to-date `main`) and `npm run check:versions` (in `npm test`; also verifies a tag with
   `--tag <lib>-vX.Y.Z`, for the publish guard in step 5). Release-please (needs conventional commits),
   Changesets and Nx/Lerna were judged overkill or a poor fit.
4. **First manual publish of `@jchpro/ngx-kit` 0.1.0** ✅ and trusted publishers linked on npmjs.com
   for both packages (repo `jchpro/ng`, workflow `publish-common.yaml` / `publish-kit.yaml`).
5. **Publish workflows → OIDC, real publish** ✅ — modelled on `garden-pda/.github/workflows/publish-core.yml`
   (`id-token: write`, `npm install -g npm@latest` for ≥ 11.5.1). Runs on `common-v*` / `kit-v*` tags only
   (no `workflow_dispatch`, so a branch can't publish; retry by re-running the job). Guard
   (`check-versions --tag`), tests, build, `npm publish --access public` from `dist/`; kit builds common
   first. No `NPM_TOKEN`, no `--provenance` (public repo, automatic) — delete the secret once a release
   went through. Not yet exercised: the first tag-triggered publish is the real test. Optional extra
   gate if wanted: a protected GitHub Environment with a required reviewer.
6. **Docs upkeep** ✅ — stage-publish notes removed from CLAUDE.md and memory.

## ngx-kit

- **Implement the `kitIcon` content-projection override pattern** (see [CLAUDE.md](CLAUDE.md))
  somewhere real — the shell header's mobile toggle (`LucideMenu`) is the obvious first
  candidate, since it's the only built-in icon in the library today.
- **Compound/non-standard form controls** — combobox, date/range picker, etc. The
  class-vs-component graduation rule was explicitly written with these in mind; nothing's been
  started yet.
- **Decide the i18n multi-language story for real.** The labels-token plumbing exists, but
  there's no actual multi-language app exercising a `computed()` signal consumer yet — docs-app
  only ever passes English. Worth either building a small toggle in docs-app or deciding this
  isn't worth proving out before a real consumer needs it.

## Accessibility

- **Keep the contrast check honest.** `npm run check:contrast` covers the token pairings the kit
  relies on, but not a component that starts using a token in a new place (a brand/accent token
  as text, say). Add the pairing to the script whenever a new color use appears.
- **Keyboard/focus-trap testing for the sidenav overlay** beyond what's covered by unit tests —
  a manual pass (or Playwright) through open/close/Escape/Tab-wrap on an actual mobile viewport
  wouldn't hurt once login (which will add another focus-trapped surface) exists.

## docs-app

- **Brand/logo icons gap.** Lucide ships no brand marks (GitHub, LinkedIn, etc.) — if docs-app
  ever adds social links (e.g. a footer), it'll need a separate small icon source for just those,
  regardless of what `ngx-kit` itself depends on.

## Possibly worth considering

- **Visual regression testing** (Chromatic or similar) once there are enough components that a
  CSS token tweak could silently break something elsewhere — not urgent at the current size, but
  cheaper to set up early than to retrofit later.
- **A dedicated "responsive shell" demo page** in docs-app that makes it easy to actually see
  the docked→overlay sidenav transition and try the mobile breakpoint override
  (`KIT_SHELL_MOBILE_QUERY`), rather than only resizing the real app shell.
