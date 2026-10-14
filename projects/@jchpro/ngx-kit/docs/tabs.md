[← back to readme](../readme.md)

# Tabs

Sections of one page where **the route is the state**: a reload or a shared link opens the same
section. A plain `<nav>` of links with CSS classes, not a component, same as the
[table](table.md) and the [page header](page-header.md). Include it with `primitives`, or
`./styles/tabs` on its own.

```html
<nav class="kit-tabs" aria-label="Version sections">
  <a class="kit-tabs__link" routerLink="general" routerLinkActive ariaCurrentWhenActive="page">General</a>
  <a class="kit-tabs__link" routerLink="questions" routerLinkActive ariaCurrentWhenActive="page">
    Questions <span class="kit-tabs__count">12</span>
  </a>
  <a class="kit-tabs__link" routerLink="tasks" routerLinkActive ariaCurrentWhenActive="page">Tasks</a>
</nav>

<router-outlet />
```

- **Links, not buttons.** The active one is marked by `aria-current="page"`, which is what
  `routerLinkActive` with `ariaCurrentWhenActive="page"` sets; the look follows that attribute, so what
  assistive technology announces and what the user sees can't drift apart. Without a router,
  `kit-tabs__link--active` gives the same look.
- **No arrow-key behavior.** The ARIA tabs pattern (`role="tablist"`, roving tabindex) is for panels that
  swap on one page. A nav of links keeps the plain Tab order, so don't add those roles.
- **Counter.** `kit-tabs__count` after the label, for "Questions 12". Its ink stays muted in every state.
- **Look.** A 1px divider runs under the whole row, the active link draws a 2px `--kit-brand-pink` line over it
  (3:1 on both surfaces, like the focus ring). The row scrolls horizontally when the links don't fit, so on a
  phone nothing wraps or gets cut.
- Give the `<nav>` an `aria-label` that says what the sections belong to.
