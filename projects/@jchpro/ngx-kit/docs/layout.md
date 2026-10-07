[← back to readme](../readme.md)

# Layout shell

`KitShell` composes a header, a collapsible sidenav, an optional footer and a main content
area. Compose it directly in your app's **root** component — not in a routed sub-component —
with `<router-outlet>` as (usually) its main content:

```html
<!-- app.html -->
<kit-shell>
  <kit-shell-header>
    <span>My App</span>
  </kit-shell-header>

  @if (hasMenu()) {
    <kit-shell-sidenav>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/settings" routerLinkActive="active">Settings</a>
    </kit-shell-sidenav>
  }

  <router-outlet></router-outlet>

  <kit-shell-footer>
    &copy; 2026
  </kit-shell-footer>
</kit-shell>
```

Its layout CSS ships as one shared stylesheet — global, not Angular-encapsulated per
component, so it's easy to override — rather than spread across each shell component. Include
it alongside the [tokens](theming.md), and mark your root component with `KitShellRoot` (via
`hostDirectives`, so every consumer of it gets marked automatically) so the shell can size
itself against the real viewport instead of an arbitrarily-styled root element:

```scss
// app's global styles
@use '@jchpro/ngx-kit/styles/tokens';
@use '@jchpro/ngx-kit/styles/shell';

@include tokens.root-styles();
@include shell.root-styles();
```

```ts
// app.ts
import { KitShell, KitShellFooter, KitShellHeader, KitShellRoot, KitShellSidenav } from '@jchpro/ngx-kit';

@Component({
  selector: 'app-root',
  imports: [KitShell, KitShellHeader, KitShellSidenav, KitShellFooter, RouterOutlet],
  hostDirectives: [KitShellRoot],
  templateUrl: './app.html',
})
export class AppComponent {}
```

The shell also renders a global loading bar at the top of the viewport — see
[Loading state](loading.md).

The header's sidenav toggle button (shown on small screens) is the only text the shell renders:
its accessible name, "Toggle navigation". Change it app-wide with
`provideKitShellLabels({ toggleNavigation: '…' })` (or `provideKitLabels('pl')` for Polish), or
for one header with `<kit-shell-header toggleNavigationLabel="…">` — see [Labels](labels.md).

`KitShellRoot` just adds the `kit-shell-root` class to its host — apply it directly
(`<app-root kitShellRoot>`) if you'd rather not use `hostDirectives`. If `<kit-shell>` can't
find it anywhere above it in the component tree, it warns to the console: the shell's CSS
targets `.kit-shell-root kit-shell`, so without it your layout silently renders unstyled.

`kit-shell` itself is capped at `height: 100dvh` — the header and footer stay pinned in view
and only the sidenav/content area (`.kit-shell__body`) scrolls. This is deliberately not
`position: fixed` on the header with a matching `margin-top` elsewhere: that needs the
header's height kept in sync by hand (or measured in JS) wherever it's used, where the flex
+ capped-height approach here needs nothing tracked at all.

## Responsive behavior

Below 768px (configurable, see below) the sidenav switches from **docked** (always visible,
part of the layout) to **overlay** (off-canvas, opened on demand): `kit-shell-header`
automatically renders a toggle button, `kit-shell-sidenav` slides in over a scrim, traps
focus while open, and closes on Escape or on any click inside it (so selecting a nav link
closes it too). Focus returns to whatever triggered the open when it closes.

Override the breakpoint by providing `KIT_SHELL_MOBILE_QUERY`:

```ts
import { KIT_SHELL_MOBILE_QUERY } from '@jchpro/ngx-kit';

providers: [
  { provide: KIT_SHELL_MOBILE_QUERY, useValue: '(max-width: 900px)' },
]
```

## Sidebar navigation

`KitShellNavSection` renders a titled, optionally-disabled group of `KitShellNavItem`s inside
`kit-shell-sidenav`. An item is a pure data holder — it renders nothing itself; the section
reads its `link`/`disabled`/`icon` and renders the actual `<a>`/`<button>`, icon and disabled
state itself, so every section looks and behaves the same without apps hand-rolling that chrome:

```html
<kit-shell-sidenav>
  <kit-shell-nav-section title="Workspace">
    <kit-shell-nav-item [link]="['/dashboard']" [icon]="dashboardIcon">Dashboard</kit-shell-nav-item>
    <kit-shell-nav-item [link]="['/settings']" [icon]="settingsIcon" [disabled]="!canManageSettings()">
      Settings
    </kit-shell-nav-item>
  </kit-shell-nav-section>

  <kit-shell-nav-section title="Account">
    <!-- No `link` — renders as a button, and `linkClick` fires on click instead of navigating. -->
    <kit-shell-nav-item [icon]="logoutIcon" (linkClick)="logOut()">Log out</kit-shell-nav-item>
  </kit-shell-nav-section>
</kit-shell-sidenav>
```

`link` accepts the same input shape as `RouterLink`'s own `routerLink` (a commands array, a
string, or a `UrlTree`); active-route styling is applied automatically via `routerLinkActive`.
`linkActiveOptions` takes the same type as `routerLinkActiveOptions` and is passed straight through to
it, e.g. `[linkActiveOptions]="{ exact: true }"` so a link to `/` isn't active on every route. The
same two inputs work for items projected into the header.
An item's effective disabled state is its own `disabled` input **or** its section's — so you can
disable a single entry, or an entire group (e.g. while a permissions check is still loading),
without threading a flag through every item by hand. Deciding *which* items/sections to show,
and when they're active or disabled, stays entirely up to your app — these two just standardize
how that ends up looking and behaving.

## Top navigation

`KitShellNavItem`s projected straight into `kit-shell-header` (alongside whatever else you put
there) render as top navigation — the same items the sidebar uses, laid out horizontally here
instead. They stay inline in the header while the sidenav is docked, and move to a second row
below the header once the sidenav collapses to overlay (the same breakpoint as the sidenav —
there's no separate one for this):

```html
<kit-shell-header>
  <a class="brand" kit-shell-header-leading routerLink="/">My App</a>
  <kit-shell-nav-item [link]="['/dashboard']" [icon]="dashboardIcon">Dashboard</kit-shell-nav-item>
  <kit-shell-nav-item [link]="['/reports']" [icon]="reportsIcon">Reports</kit-shell-nav-item>
  <span class="flex-grow"></span>
  <app-theme-selector></app-theme-selector>
</kit-shell-header>
```

Keep it to 3-4 items — the second row needs to stay fully visible at mobile widths, and it
scrolls horizontally rather than wrapping if it doesn't fit. A `KitShellNavItem` renders
nothing itself wherever you put it, same as inside `KitShellNavSection` — `kit-shell-header`
places the actual rendered nav row right after whatever's marked `kit-shell-header-leading`
(typically your brand/logo) and before everything else projected in, so a trailing spacer +
actions still end up pushed to the far end of the row. Without a `kit-shell-header-leading`
element, nav renders first, ahead of everything else projected in.

The second row just makes the header taller; nothing needs tracking by hand for it. `kit-shell`'s
`height: 100dvh` cap and `.kit-shell__body`'s `flex: 1; min-height: 0` (see above) already give
the header whatever height its content needs and shrink the scrollable body to fit what's left.

## Custom control

`KitShell` provides `KitShellState` to its whole subtree — inject it from your own routed
content (e.g. to close the sidenav after a programmatic navigation) instead of reaching for
`@ViewChild`:

```ts
import { inject } from '@angular/core';
import { KitShellState } from '@jchpro/ngx-kit';

const shell = inject(KitShellState);
shell.sidenavMode();  // Signal<'docked' | 'overlay'>
shell.sidenavOpen();  // Signal<boolean>
shell.closeSidenav();
```
