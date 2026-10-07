# Roadmap / idea backlog

Not a commitment list — a parking lot for things worth doing eventually. Pull items into actual
work when there's time; delete or rewrite anything that stops being true.

## Next up

- **Phase 4 — login view.** The only remaining phase of the original `ngx-kit` plan. Paused
  deliberately after phase 3 so docs-app could be wired up first; design it directly in code,
  as the shell was, using the same labels-token i18n pattern.

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
