[← back to readme](../readme.md)

# Labels and translations

Every user-facing string the kit renders — visible text and accessible names alike — goes through
a per-feature labels token with English defaults, and can be changed without touching the
components. The kit has no i18n dependency (not even a peer one): labels are plain strings, you
bring the translations.

| Feature | Token | Provider | Sets |
|---|---|---|---|
| [Dialogs](dialogs.md) | `KIT_DIALOG_LABELS` | `provideKitDialogLabels()` | `KIT_DIALOG_LABELS_EN`, `KIT_DIALOG_LABELS_PL` |
| [Layout shell](layout.md) | `KIT_SHELL_LABELS` | `provideKitShellLabels()` | `KIT_SHELL_LABELS_EN`, `KIT_SHELL_LABELS_PL` |

Each token holds a `Signal` of the feature's labels, so they can follow a language switch at
runtime.

## Layers

The closest one wins:

1. the English **defaults**;
2. the **app-wide** labels, from `provideKitLabels()` or a per-feature provider;
3. the **call or instance**'s own option — `title`/`confirmLabel`/… on a dialog call,
   `toggleNavigationLabel` on `<kit-shell-header>`.

## App-wide

```ts
// app.config.ts
providers: [
  // every feature of the kit, in Polish (English is the default, 'en' only resets to it)
  provideKitLabels('pl'),

  // change just some labels — merged over the defaults, so pass only what differs
  provideKitDialogLabels({ buttons: { ok: 'Got it' } }),
  provideKitShellLabels({ toggleNavigation: 'Menu' })
]
```

`provideKitLabels(...)` applies in order, so put it before any per-feature override. The
`_EN`/`_PL` constants are complete sets, typed against the feature's labels interface (so
TypeScript catches a missing field), and are accepted anywhere an override is.

## Following your own i18n library

Pass a **signal** instead of a value — the labels are re-merged whenever it changes:

```ts
provideKitDialogLabels(computed(() => ({
  titles: { danger: transloco.translate('confirm.title') },
  buttons: {
    ok: transloco.translate('common.ok'),
    cancel: transloco.translate('common.cancel')
  }
})))
```

(`computed` runs in an injection context, so `inject()` your i18n service in a factory provider
if you need it there.)

## Adding a language

Build a full set once, typed so nothing is missed, and hand it to the providers:

```ts
const DIALOGS_DE: KitDialogLabels = { titles: { … }, buttons: { … } };
const SHELL_DE: KitShellLabels = { toggleNavigation: 'Navigation umschalten' };

providers: [provideKitDialogLabels(DIALOGS_DE), provideKitShellLabels(SHELL_DE)]
```

V1 is flat strings only — no rich content or placeholders inside labels.
