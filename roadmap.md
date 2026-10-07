# Roadmap / idea backlog

Not a commitment list — a parking lot for things worth doing eventually. Pull items into actual
work when there's time; delete or rewrite anything that stops being true.

## Next up

- **Phase 4 — login view.** The only remaining phase of the original `ngx-kit` plan. Paused
  deliberately after phase 3 so docs-app could be wired up first; design it directly in code
  (no jchPRO artifact spec exists yet for it either, same as the shell was handled), using the
  same labels-token i18n pattern as the shell.

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
- **Backfill the jchPRO design-system artifact** with the shell/login specs once they're stable,
  so the artifact stops lagging behind the code (it currently only specs Button/Card/Field).

## Accessibility

- **Contrast audit.** The `--kit-brand-violet-muted`-as-text bug (fixed 2026-10-04 in docs-app)
  was a one-off catch, not a systematic check — worth a quick pass over every place a
  brand/accent token is used as text color (vs. its intended use as a fill) in both themes,
  before it ships to a real consumer who won't have a design-system author in the room to catch
  it.
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
