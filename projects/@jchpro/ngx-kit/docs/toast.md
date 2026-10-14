[← back to readme](../readme.md)

# Toasts

Non-blocking messages: "Saved.", "Item deleted. Undo", where a dialog would be too much and a line of text next to the
button gets missed. `KitToastService` shows them in an overlay; the look is the `kit-toast` classes. It needs
`@jchpro/ngx-kit/styles/overlay` included once (as the [dialogs](dialogs.md) and [menus](menu.md) do) and the toast styles,
`primitives` or `./styles/toast` on their own.

```ts
readonly #toasts = inject(KitToastService);

this.#toasts.success('Saved.');
this.#toasts.error('Could not save the changes.');

// An action, and what the person did with the toast
const reason = await this.#toasts.info('Item deleted.', { action: 'Undo' }).closed;   // 'timeout' | 'dismissed' | 'action'
if (reason === 'action') {
  this.restore();
}
```

- **`success()`, `error()`, `info()`** take the message (plain text) and the options below, and return a `KitToastRef`:
  `closed`, a Promise of why the toast went away (`'timeout'`, `'dismissed'` by its close button, Escape or `dismiss()`, or
  `'action'`), and `dismiss()`. `dismissAll()` on the service closes everything, the toasts still waiting too.
- **How long they stay.** A success 4 s, an info 5 s. **An error stays until it is closed**: a message that goes away by itself
  is one that can be missed, and an error is the one to read. A toast with an action stays at least 8 s, the time to notice it
  and decide.
- **Choosing the time.** `provideKitToasts({ durations: { success: 3000, error: 10000, info: null }, actionMinDuration: 6000 })`
  sets it for the app (`null`: until closed). A call's own `duration` wins over all of it, the action minimum included:
  `toasts.error('Offline', { duration: 8000 })`, `toasts.success('Copied', { duration: null })`. A duration is a positive
  number of milliseconds: there is no "instant", and `0` or a negative one throws.
- **Hover and focus pause the clock.** While the pointer is over a toast or the focus is on one of its buttons it doesn't run,
  and it goes on from what was left afterwards, at least a second.
- **Announced.** A success or an info toast politely (`role="status"`), an error at once (`role="alert"`): two live regions that
  are in the page a moment before the first message goes into them, which is why the very first toast shows 50 ms late. A toast
  that has the focus closes with Escape.
- **Where and how many.** `provideKitToasts({ position: 'bottom-end' })` (default) or `top-start`, `top-center`, `top-end`,
  `bottom-start`, `bottom-center`. At most `max` (5) show at once, the others wait for room, in order, and their clock starts
  when they show. A toast is always above a dialog that opened after it.
- **Labels.** The region's name and the close button's, `KIT_TOAST_LABELS` (`provideKitToastLabels()`, EN and PL, part of
  `provideKitLabels()`), see [Labels](labels.md). The message and the action's label are yours to translate.
