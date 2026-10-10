[← back to readme](../readme.md)

# Page header

The top of a page: breadcrumb, title, and the page's **main actions** (the "Create user" kind)
aligned to the right of the title. Plain CSS classes, not a component — the trail, the buttons
and the menus are all app-specific, this only lays them out. Include it with `primitives`, or
`./styles/page-header` on its own.

```html
<header class="kit-page-header">
  <nav class="kit-page-header__breadcrumb" aria-label="Breadcrumb">
    <ol class="kit-breadcrumb">
      <li><a class="kit-breadcrumb__item" routerLink="/">Home</a></li>
      <li><span class="kit-breadcrumb__item" aria-current="page">Users</span></li>
    </ol>
  </nav>

  <h1 class="kit-page-header__title">Users</h1>
  <p class="kit-page-header__subtitle">People with access to this workspace</p>

  <div class="kit-page-header__actions">
    <button type="button" class="kit-btn kit-btn--ghost kit-btn--icon"
            aria-label="More actions" [kitMenuTriggerFor]="more">
      <svg lucideEllipsisVertical></svg>
    </button>
    <button type="button" class="kit-btn kit-btn--secondary">Export</button>
    <button type="button" class="kit-btn kit-btn--primary kit-btn--lg" (click)="create()">
      <svg lucidePlus></svg> Create user
    </button>
  </div>
</header>
```

Every part is optional — without a subtitle or breadcrumb the rows just collapse. Actions sit
in DOM order, so write the primary one **last**: it ends up at the far right. The breadcrumb stays plain markup: the kit
only styles it (see [Primitives](primitives.md)), the trail comes from your routes.

## Which actions go where

- **One primary** action per page, `kit-btn--primary`, with an icon and `kit-btn--lg` so it
  reads as the headline action.
- **Up to two secondary** ones, `kit-btn--secondary` or `kit-btn--ghost`.
- Everything else in a [menu](menu.md), behind an icon-only `kit-btn--icon` trigger.

## Mobile

Below 768px the actions drop onto their own row under the title, each button sharing it
equally (icon buttons keep their square). The breakpoint is the shell's default one — a media
query can't read `KIT_SHELL_MOBILE_QUERY`, so if you changed that token, override this too.

## Sticky

Add `kit-page-header--sticky` to pin the header to the top of the shell's scrolling content
area. It's sized for that area's `--kit-space-4` padding — it bleeds out over it, with the
canvas color behind and a bottom border, so the page scrolls cleanly underneath. Don't use it
outside the shell's content area.
