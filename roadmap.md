# Roadmap / idea backlog

Not a commitment list — a parking lot for things worth doing eventually. Pull items into actual
work when there's time; delete or rewrite anything that stops being true.

## Next up

- **Phase 4 — auth views (local auth only).** The only remaining phase of the original `ngx-kit`
  plan; in progress on `feat/kit-auth`. Two layers, the components built on the pieces:
  - Pieces: `KitAuthCard` (shell: card, logo/title slot, `role="alert"` error, footer slot),
    `KitPasswordToggle` (show/hide on a native input, no `@angular/forms` dependency, `kitIcon`
    slots), `.kit-auth-notice` (confirmation views), plus the existing field and button classes —
    so a signal-forms app composes its own form with the same look.
  - Self-contained components: `KitLogin` (identifier, password, remember me), `KitForgotPassword`
    (identifier), `KitSetPassword` (new password + confirmation; `flow="reset" | "invite"` picks
    the default labels, a slot takes extra invite fields).
  - No auth logic or routing in the kit: components emit `submitted`/`requested`, the app reads the
    token from the URL and makes the request. `[busy]`/`[error]` inputs; `identifierType: 'email' |
    'username'`; labels via the usual token (`KIT_AUTH_LABELS`, EN + PL).
  - Later: per-field server errors on `KitSetPassword`, MFA, registration without an invite.

## CI & releases

The flow itself is done (PR → CI, `<lib>-v*` tag → OIDC publish, merge to `main` → docs-app deploy; how
to release is in [CLAUDE.md](CLAUDE.md)). What's left:

- **Delete the `NPM_TOKEN` repo secret.** The tag-triggered publish has worked (kit 0.2.0), and no
  workflow reads it any more.
- **Try `npm run release -- ship` on the next real release** (see [releasing.md](releasing.md)); it
  has only been checked against a finished release (`--dry-run`, and `finish` on 0.2.0, which
  correctly found the tag already on origin), not run end to end.
- **Atomic docs-app deploy** (optional): swap the bundle in with a `mv` instead of `rm -rf` + `cp`,
  which leaves a brief empty-site window.
- **Drop `@angular/platform-browser-dynamic`** (direct dependency, deprecated in favour of
  `@angular/platform-browser`).

## ngx-kit

- **Data tables** (server-driven lists, the common admin-app view). Approach: native `<table>` +
  `@for` (typed rows for free, always `track row.id`), not Material-style `ng-template` column
  defs. `kit-data-table` is a layout-only wrapper: framed card with slots (`kitTableSearch`,
  `kitTableFilter`, `kitTableActions`, the table itself, the paginator) and loading / empty / error
  states. Decisions: search top-left (debounce in the state, not the input); up to 3 inline filters
  with applied-filter chips and "Clear all" (overlay filter panel later, with combobox); header cell
  is a `<button>` sort toggle (asc ↔ desc, opt-in `cycle` for a "none" state, single column, `aria-sort`);
  no zebra, sticky header, `kit-table--compact`, horizontal scroll on narrow screens. Column
  conventions as classes: `kit-cell--num` (right, tabular), `--truncate`, `--mono`, `--actions` (one
  inline icon button + CDK-menu kebab), `--select`; booleans as icon + text; status as a new
  `.kit-badge`; empty value as an em dash. `KitPaginator` (`page`/`pageSize` as `model()`, `total`,
  `pageSizes`, `total = null` + `hasNext` for cursor APIs, labels via `KIT_TABLE_LABELS` EN/PL; no
  numbered page buttons). Phases:
  1. **Design shells** (done, kit 0.3.0 unreleased): `_table.scss`, `.kit-badge`, `KitSort` (a `th[kitSort]`
     component, not a directive: it renders the button), `KitPaginator`, `KitDataTable`, labels, `docs/table.md`, changelog,
     and the docs-app Table page.
  2. **Wiring** (done, kit 0.3.0 unreleased): `kitTableState()` (signals for query / filters / sort / page / pageSize +
     computed `params`), bound by `[state]` to `kitSearch` / `kitFilter` / `kitSort` / `kit-paginator`; `[resource]` and
     `[total]` on the frame; page resets to 1 on query/filter/sort/page-size change; **opt-in** URL query-param sync;
     `resource()` example in docs-app. Possible follow-ups: push (not replace) history for paging, a chips helper that
     renders `activeFilters` with labels, `hasNext` from the frame for cursor APIs.
  3. **Extras** (done, kit 0.3.0 unreleased): selection + bulk-action bar (`kitTableSelection`), `KitPopover` + filters panel,
     column visibility (`kitTableColumns`, `kitCol`, `KitColumnPicker`), density toggle, client-side helper
     (`kitClientTable`, `applyKitTableParams`). Also done: `kit-filter-chips`, `urlSync` `history: 'push'`, `hasNext` on the frame, `densityStorageKey`.
     Still open: row expansion, a "select all N matching rows" for server-side bulk actions.
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
