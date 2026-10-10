# jchPRO admin-app UI kit

Layout shell, form primitives and a login view for admin-style Angular apps, styled with the **App** surface of the jchPRO look. Built on Angular CDK — no Material, no bundled i18n library.

## Installation

Required peer dependencies are:

- `@angular/cdk`
- `@angular/common`
- `@angular/core`
- `@jchpro/ngx-common`
- `@lucide/angular` — the icon set the kit's components use for their built-in icons

Optional: `@angular/forms`, for the [Signal Forms helpers](docs/forms.md) (`KitFieldError`, `resetKitForm`).

```shell
npm i @jchpro/ngx-kit
```

## Documentation

- [Tokens & theming](docs/theming.md) — the App-surface design tokens, `KitThemeService`, required Google Fonts
- [Primitives](docs/primitives.md) — Button, Field, Card and status-dot CSS classes
- [Layout shell](docs/layout.md) — `KitShell`, the responsive header/sidenav/footer composition
- [Page header](docs/page-header.md) — breadcrumb, title and the page's main actions
- [Prose](docs/prose.md) — `kit-prose` for long-form content: headings, links, quotes, code, tables
- [Auth views](docs/auth.md) — local sign-in: `KitLogin`, `KitForgotPassword`, `KitSetPassword` (reset and invitation) and the pieces to build your own
- [Dialogs](docs/dialogs.md) — one dialog look, `KitDialogService` with Promise-based `alert`/`confirm`
- [Labels and translations](docs/labels.md) — every built-in string is overridable: defaults, app-wide, per call; `provideKitLabels('pl')`
- [Data tables](docs/table.md) — `KitDataTable` frame, `KitSort` headers, `KitPaginator`, column conventions, `kit-badge`
- [Forms](docs/forms.md) — `<kit-field-error>` for a Signal Forms field, `resetKitForm()`
- [Testing helpers](docs/testing.md) — `@jchpro/ngx-kit/testing`: `settle`, `openMenu`, `type`, `pick`, `submit`
- [Menus](docs/menu.md) — contextual menus on CDK overlays: `kitMenuTriggerFor`, `kitMenu`, `kitMenuItem`
- [Loading state](docs/loading.md) — `kitBusy` for buttons and panels, the shell's global loading bar
