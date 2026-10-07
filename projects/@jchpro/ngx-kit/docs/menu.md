[← back to readme](../readme.md)

# Menus

Contextual menus opened from a button, built on the CDK's `menu` — keyboard navigation
(arrows, Home/End, typeahead, Escape), focus return and ARIA all come from there. The kit
adds consistent styling and a small API. No nesting (submenus) for now.

## Setup

Menus render in the CDK overlay container, which needs its structural CSS once, in your global
stylesheet. The menu look itself is part of `primitives` (or `./styles/menu` on its own):

```scss
@use '@jchpro/ngx-kit/styles/overlay';
@use '@jchpro/ngx-kit/styles/primitives';

@include overlay.root-styles();
@include primitives.classes();
```

## Usage

Import `KitMenuTrigger`, `KitMenu` and `KitMenuItem`.

```html
<button type="button" class="kit-btn kit-btn--ghost" [kitMenuTriggerFor]="rowMenu">Actions</button>

<ng-template #rowMenu>
  <div kitMenu>
    <button type="button" kitMenuItem (click)="edit()"><svg lucidePencil></svg> Edit</button>
    <a kitMenuItem routerLink="/users/1">Open</a>
    <hr class="kit-menu__separator">
    <button type="button" kitMenuItem danger (click)="remove()"><svg lucideTrash></svg> Delete</button>
  </div>
</ng-template>
```

| | |
|---|---|
| `[kitMenuTriggerFor]` | On any element — the `<ng-template>` to open |
| `kitMenu` | On the template's root element, the panel |
| `kitMenuItem` | A `<button>` (handle with `(click)`) or `<a>`; activating it closes the menu |
| `danger` | On an item — destructive action, danger color |
| `[disabled]` | On an item — shown inactive, clicks are swallowed. Bind it instead of the native attribute, it works on links too |
| `[checked]` | On an item — makes it a choice (`menuitemradio`, `aria-checked`). The state is yours: keep it in a signal and show it, usually with an icon |
| `checkbox` | With `[checked]` — an independent on/off option (`menuitemcheckbox`) instead of one of an exclusive group |
| `.kit-menu__separator` | Class for an `<hr>` between groups |
| `.kit-menu__label` | Class for a non-interactive heading of a group (the stand-in for submenus: one flat menu, a label per group) |
| `[kitMenuPosition]` | On the trigger — your own `ConnectedPosition[]`; the default opens below, aligned to the start, and flips to the end edge or above when it doesn't fit |
| `[kitMenuTriggerData]` | On the trigger — context for the template, read with `let-data` |
| `(kitMenuOpened)`, `(kitMenuClosed)` | On the trigger |

Icons are optional: put an `<svg>` before the label. An icon-only trigger — the usual "more"
button on a table row — is a `kit-btn--icon` and needs an `aria-label`:

```html
<button type="button" class="kit-btn kit-btn--ghost kit-btn--icon"
        aria-label="Row actions" [kitMenuTriggerFor]="rowMenu">
  <svg lucideEllipsisVertical></svg>
</button>
```
