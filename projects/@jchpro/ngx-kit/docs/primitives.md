[← back to readme](../readme.md)

# Primitives

Plain CSS classes, not components — apply them to native elements. Include all of them with
`@use '@jchpro/ngx-kit/styles/primitives'; @include primitives.classes();`, or cherry-pick
`./styles/button`, `./styles/field`, `./styles/card`, `./styles/status-dot`, `./styles/badge`, `./styles/table`,
`./styles/breadcrumb`, `./styles/loading`, `./styles/menu`, `./styles/page-header`,
`./styles/dialog`, `./styles/check`, `./styles/range`, `./styles/progress`, `./styles/fieldset`, `./styles/prose` individually. The loading classes (`kit-spinner`, `kit-skeleton`, `kit-busy`)
are covered in [Loading state](loading.md), the menu ones in [Menus](menu.md), the page header in
[Page header](page-header.md), the dialog ones in [Dialogs](dialogs.md), the table, badge and cell classes in [Data tables](table.md).

The color modifiers are `kit-btn--primary`, `kit-btn--secondary`, `kit-btn--ghost` and `kit-btn--danger`
(a destructive action, such as confirming a delete).

Buttons also take optional size modifiers next to the color one. `kit-btn--icon` makes the
button square for an icon-only one — give it an `aria-label`. `kit-btn--lg` is a taller, roomier
button, meant for a page's headline action (see [Page header](page-header.md)).
They combine: `class="kit-btn kit-btn--ghost kit-btn--icon kit-btn--lg"`.

`kit-btn` works on every native button-like element — `<button>`, an `<a>` that looks like a button, and
`<input type="button | submit | reset">` (its `value` is the label):

```html
<a class="kit-btn kit-btn--secondary" routerLink="/users">Users</a>
<a class="kit-btn kit-btn--ghost" aria-disabled="true" tabindex="-1">Unavailable</a>
<input class="kit-btn kit-btn--primary" type="submit" value="Send">
```

Hover and press darken the fill (the ghost button gets the violet tint instead), and a disabled button
ignores both. A link has no native `disabled`, so `aria-disabled="true"` stands in for it, and the kit
also stops it taking clicks. With [`kitBusy`](loading.md) a `<button>` or link swaps its label for a
spinner; an `<input>` can't draw one, so it keeps its label and is dimmed. An `<input type="image">` is
its image and is left alone. As with any native button, a `<button>` or `<input>` without a `type`
inside a form submits it.

Requires the [tokens](theming.md) to be included first.

```html
<button type="button" class="kit-btn kit-btn--primary">Save</button>
<button type="button" class="kit-btn kit-btn--secondary">Cancel</button>
<button type="button" class="kit-btn kit-btn--ghost">More</button>

<div class="kit-field">
  <label class="kit-field__label" for="email">Email</label>
  <input class="kit-field__control" id="email" type="email">
</div>

<div class="kit-card">
  <h3 class="kit-card__title">Project Alpha</h3>
  <p class="kit-card__body">Some details about the project.</p>
  <div class="kit-card__meta">
    <span class="kit-status-dot kit-status-dot--success"></span>
    <span>Published</span>
  </div>
</div>

<nav aria-label="Breadcrumb">
  <ol class="kit-breadcrumb">
    <li><a class="kit-breadcrumb__item" routerLink="/projects">Projects</a></li>
    <li><span class="kit-breadcrumb__item" aria-current="page">Project Alpha</span></li>
  </ol>
</nav>
```

Breadcrumbs are deliberately not a component: deriving the trail from your routes is
app-specific, so build the `<a>`/`<span>` list from whatever your app already has (route data, a
context service, etc.) — this only standardizes how it looks. Mark the final, non-link segment
with `aria-current="page"` rather than a modifier class.

## Checkbox, radio and switch

Classes on the native inputs — no component, so forms, `name`, `checked`, `disabled` and
`ngModel`/reactive forms all work as with any `<input>`. Wrap input and text in a
`kit-check` label (it lays them out and makes the whole line clickable):

```html
<label class="kit-check"><input class="kit-check__input" type="checkbox"> Send me updates</label>

<label class="kit-check"><input class="kit-check__input" type="radio" name="plan" value="pro"> Pro</label>

<label class="kit-check"><input class="kit-check__input" type="checkbox" role="switch"> Notifications</label>

<!-- several in a row or a column -->
<div class="kit-check-group kit-check-group--inline"> … </div>
```

A **switch** is a checkbox with `role="switch"`: the ARIA role picks the look, so what assistive
technology announces and what the user sees can't drift apart. Indeterminate checkboxes
(`input.indeterminate = true`) get a dash. Without a wrapping label, give the input an `aria-label`.

Unchecked controls have a `--kit-border-control` outline, the same edge as a Field, which keeps them at 3:1
against the surface; selected ones fill with `--kit-brand-violet-muted` and a white mark, and keep the
outline (the fill alone is only 2.4:1 on the dark raised surface). A control marked `aria-invalid="true"`
turns its outline `--kit-status-danger`; put the message under the group (see Invalid fields). In forced-colors (Windows high contrast) the native
control is restored. Include `./styles/check` on its own, or via `primitives`.


## Range, progress and meter

Classes on the native elements, so `min`, `max`, `value`, `disabled` and forms behave as with any
`<input type="range">`, `<progress>` or `<meter>`:

```html
<input class="kit-range" type="range" min="0" max="100" value="40">
<progress class="kit-progress" max="100" value="65">65%</progress>
<progress class="kit-progress">Working</progress>
<meter class="kit-meter" min="0" max="100" low="30" high="80" optimum="90" value="55">55</meter>
```

- **Range** — a thumb on a track. CSS can't read the value back out of the input, so the filled
  part of the track is opt-in: bind `--kit-range-fill` to the value as a percentage
  (`(value - min) / (max - min) * 100`), e.g. `[style.--kit-range-fill]="v() + '%'"`. Without it
  the thumb alone marks the value. Tick marks from a `list` attribute are the browser's to draw and
  are lost with the custom look; build a visible scale in markup if you need one.
- **Progress** — a violet fill on a track; without a `value` it becomes an indeterminate sweep
  (still, centered, under reduced motion).
- **Meter** — the color comes from where the value falls against `low`, `high` and `optimum`,
  decided by the browser: green in the good zone, amber in the middle one, red in the bad one.

Include `./styles/range` and `./styles/progress` (progress and meter) on their own, or via
`primitives`. Each browser engine styles these through its own pseudo-elements, so both WebKit/Blink
and Firefox are covered.

## Invalid fields

Mark a control invalid with `aria-invalid="true"` and explain it under the control. Native validation
shows the same look once the person has interacted with the field (`:user-invalid`); the kit never keys
off `:invalid`, which matches an untouched required field.

```html
<div class="kit-field">
  <label class="kit-field__label" for="email">Email</label>
  <input class="kit-field__control" id="email" type="email"
         aria-invalid="true" aria-describedby="email-error">
  <p class="kit-field__error" id="email-error"><svg lucideCircleAlert></svg>Enter a valid email address.</p>
</div>
```

The border becomes `--kit-status-danger` at 2px (the field doesn't shift), and a focused invalid field
rings in danger too, since the pink focus ring is only about 1.3:1 from the danger color. The message line
is `kit-field__error` (an icon and the text in `--kit-status-danger-ink`, both required so the error is
never only a color), or `kit-field__hint` (muted text) while there is nothing to report. Text inputs,
textarea, select, file and color take the whole treatment; checkbox, radio and switch swap their outline
to danger, with the message under the group or fieldset. Range, progress and meter have no invalid state.

## Fieldset and legend

Classes on the native `<fieldset>` and `<legend>`, which keep their job: the legend names the group
for assistive technology, and `disabled` on the fieldset disables everything inside it.

```html
<fieldset class="kit-fieldset">
  <legend class="kit-fieldset__legend">Notifications</legend>
  <div class="kit-check-group"> … </div>
</fieldset>

<!-- no border, the legend reads as a heading -->
<fieldset class="kit-fieldset kit-fieldset--plain">
  <legend class="kit-fieldset__legend">Plan</legend>
  …
</fieldset>
```

The fieldset is a grid with a gap, so whatever sits directly inside it (a `kit-field`, a
`kit-check-group`) is spaced with no margins of its own. Fieldsets nest; use `--plain` for the inner
ones. Controls in a disabled fieldset already dim themselves, so only the legend is muted.
Include `./styles/fieldset` on its own, or via `primitives`.
