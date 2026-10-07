[← back to readme](../readme.md)

# Dialogs

One look for every dialog, built on the CDK's `Dialog`, and a service that opens them and
answers with Promises. It covers the common admin-app cases out of the box — *tell the user
something* (`alert`) and *ask them something* (`confirm`) — and lays out your own dialog
components the same way.

## Setup

Dialogs render in the CDK overlay container, which needs its structural CSS once. The dialog
look itself is part of `primitives` (or `./styles/dialog` on its own):

```scss
@use '@jchpro/ngx-kit/styles/overlay';
@use '@jchpro/ngx-kit/styles/primitives';

@include overlay.root-styles();
@include primitives.classes();
```

## `KitDialogService`

```ts
const dialogs = inject(KitDialogService);

await dialogs.alert({ message: 'Saved.' });
await dialogs.alert({ tone: 'error', message: error.message });

if (await dialogs.confirm({ tone: 'danger', message: 'Delete the user?', confirmLabel: 'Delete' })) {
  await this.users.delete(id);
}
```

- **`alert(options)`** — one button; resolves (`void`) once it's dismissed.
- **`confirm(options)`** — two buttons; resolves `true` when confirmed, `false` when cancelled **or
  dismissed** (Escape, a backdrop click, navigating away).
- **`open(component, config)`** — your own component, see below.

None of them ever reject, so a plain `await` is always safe.

Options of `alert()` and `confirm()`:

| Option | |
|---|---|
| `message` | The text. Line breaks (`\n`) are kept |
| `tone` | `info` (default), `success`, `warning`, `danger`, `error` — colors the icon. `danger` is for a destructive action about to happen: its confirm button turns red and focus starts on Cancel. `error` is for something that just failed. Both are announced as an `alertdialog` |
| `title` | Replaces the default title for the tone |
| `buttons` | `alert`: `'ok'` (default) or `'close'`. `confirm`: `'ok-cancel'` (default) or `'yes-no'` — these only pick the default labels |
| `buttonLabel` | `alert` only: replaces the button's label |
| `confirmLabel`, `cancelLabel` | `confirm` only: replace the labels |

## Your own dialogs

Open any component, and lay it out with the `kit-dialog` classes:

```ts
const ref = dialogs.open<User, { user: User }, EditUserDialog>(EditUserDialog, {
  data: { user },
  size: 'md'
});
const updated = await ref.result;   // User, or undefined if dismissed
```

```html
<!-- EditUserDialog's template; its host has class="kit-dialog" -->
<header class="kit-dialog__header">
  <h2 kitDialogTitle>Edit user</h2>
</header>
<div class="kit-dialog__body">
  …form…
</div>
<footer class="kit-dialog__footer">
  <button class="kit-btn kit-btn--ghost" [kitDialogClose]="undefined">Cancel</button>
  <button class="kit-btn kit-btn--primary" [kitDialogClose]="user()">Save</button>
</footer>
```

```ts
@Component({
  imports: [KitDialogTitle, KitDialogClose],
  host: { 'class': 'kit-dialog' },
  …
})
export class EditUserDialog {
  readonly data = inject<{ user: User }>(DIALOG_DATA);
  readonly #ref = inject(DialogRef<User>);   // to close from code: this.#ref.close(user)
}
```

- `kitDialogTitle` marks the heading, styles it, and makes it the dialog's accessible name.
- `[kitDialogClose]="value"` closes the dialog on click and resolves `result` with the value.
  Always bind a value; a `<button>` without a `type` becomes `type="button"`.
- Header, body and footer are optional. The body is the part that scrolls, the header and footer
  stay in view.
- An icon badge in the header is `<span class="kit-dialog__icon"><svg …></svg></span>` inside a
  `kit-dialog--info|success|warning|danger|error` host.

`KitDialogConfig` also takes `size` (`sm` 400px, `md` 520px, `lg` 720px), `role`, `disableClose`
(Escape and backdrop no longer close it), `panelClass`, `autoFocus` and an `injector`. Whatever
the size, a dialog never gets wider than the viewport minus a margin, so on a phone it's near full
width, centered.

`KitDialogRef` has `result` (a Promise, settled once when the dialog closes; `undefined` when it
was dismissed), `close(result?)` and `componentInstance`.

## Labels and translations

The titles and button labels of `alert()` and `confirm()` come from `KIT_DIALOG_LABELS` — a default
title per tone and the `ok`, `cancel`, `yes`, `no` and `close` buttons — and layer like this, the
closest winning: English defaults, then app-wide (`provideKitDialogLabels()`, or
`provideKitLabels('pl')` for the whole kit), then the call's own `title`, `confirmLabel`,
`cancelLabel` and `buttonLabel`. `KIT_DIALOG_LABELS_EN` and `KIT_DIALOG_LABELS_PL` are complete sets.
Everything about overriding, signals and your own i18n library is in [Labels](labels.md).

## Accessibility

Dialogs trap focus, close on Escape, restore focus to what opened them, and hide the rest of the
page from assistive technology (all from the CDK). `danger` and `error` dialogs are announced as
an `alertdialog`, and a danger confirmation starts with focus on the safe choice, Cancel.
