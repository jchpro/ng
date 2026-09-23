[← back to readme](../readme.md)

# Loading state

Two levels: a **local** indicator on the element that's waiting (a button, a card, a form), and
a **global** bar at the top of the viewport that `KitShell` renders on its own.

## Local — `kitBusy`

```scss
@use '@jchpro/ngx-kit/styles/loading';
@include loading.classes();   // or just `primitives.classes()`, which includes it
```

```html
<button type="button" class="kit-btn kit-btn--primary" [kitBusy]="saving()" (click)="save()">
  Save
</button>

<section class="kit-card" [kitBusy]="loading()">…</section>
```

Import `KitBusy` into the component. While `kitBusy` is true:

- on a **button** (`<button>`, `<a>`, `[role=button]`, `.kit-btn`) the label and icons are
  replaced by a spinner, with the width unchanged so nothing jumps. Clicks are swallowed, but
  the button is *not* `disabled`, so it keeps focus;
- on **anything else** a scrim and spinner cover it and its content becomes `inert` — neither
  pointer nor keyboard can reach it;
- `aria-busy="true"` is set either way.

A bare `kitBusy` attribute means busy.

### Standalone classes

```html
<span class="kit-spinner"></span>                       <!-- 1.25em, inherits text color -->
<span class="kit-spinner" style="--kit-spinner-size: 2rem"></span>
<div class="kit-skeleton" style="height: 80px"></div>   <!-- placeholder for loading content -->
```

Under `prefers-reduced-motion` the spinner slows down rather than stops, and skeletons stop
shimmering.

## Global — the top bar

`KitShell` renders the bar and marks its main area `aria-busy` while anything is loading. It
is driven by `KitLoadingService`, which counts overlapping operations so the bar stays up until
the last one ends:

```ts
const loading = inject(KitLoadingService);

const done = loading.begin();   // ...later
done();                         // idempotent, safe in `finally`

await loading.track(promise);   // or loading.track(observable$) — pass-through, stops on
                                // settle / complete / error / unsubscribe
loading.isLoading();            // Signal<boolean>
```

To avoid flicker the bar appears only after an operation lasts 150 ms, and once shown stays at
least 400 ms. Tune both with `KIT_LOADING_OPTIONS`:

```ts
{ provide: KIT_LOADING_OPTIONS, useValue: { showDelay: 300, minVisible: 600 } }
```

### Automatic sources (opt-in)

Nothing is tracked automatically unless you ask — blanket tracking is rarely right (polling,
background refreshes).

```ts
provideHttpClient(withInterceptors([kitLoadingInterceptor]));  // every HTTP request
provideKitNavigationLoading();                                  // router navigations, incl. lazy loading and resolvers
```

Keep a request out of the bar (e.g. polling) with the `KIT_LOADING_SKIP` context flag:

```ts
http.get('/api/status', { context: kitLoadingSkipContext() });
```
