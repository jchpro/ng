[← back to readme](../readme.md)

# Forms

The kit doesn't wrap form controls: a native `<input class="kit-field__control">` is the control (see
[Primitives](primitives.md)). Two helpers cover what surrounds a control in a form built with Angular's Signal
Forms. `@angular/forms` is an **optional** peer dependency, needed only for these.

## The error line: `<kit-field-error>`

```html
<div class="kit-field">
  <label class="kit-field__label" for="name">Name</label>
  <input class="kit-field__control" id="name" [formField]="form.name" aria-describedby="name-error">
  <kit-field-error id="name-error" [field]="form.name" />
</div>
```

It renders the first error of the field as the `kit-field__error` line (icon and text), once the field is
**touched** — the person left it, or tried to submit. Without an error, or before the field is touched, it renders
nothing and the host has no class. Point the control at it with `aria-describedby`, and set `aria-invalid` on the
control yourself.

The text is chosen by the `kind` of the error:

| Kind | English default | Placeholders |
|---|---|---|
| `required` | This field is required. | |
| `email` | Enter a valid email address. | |
| `min` | Enter a value of at least {min}. | `{min}` |
| `max` | Enter a value of at most {max}. | `{max}` |
| `minLength` | Enter at least {min} characters. | `{min}` is the length |
| `maxLength` | Enter at most {max} characters. | `{max}` is the length |
| `pattern` | The value is in the wrong format. | |

For any other kind: the text from `[messages]`, then the `message` of the error itself, then the generic
`fallback` label (“The value is not valid.”).

```html
<kit-field-error [field]="form.nickname" [messages]="{ reserved: 'This nickname is reserved.' }" />
```

`[messages]` is `Record<kind, text>` and wins over the built-in texts, so it also rewords a built-in kind; the
placeholders work in it too.

> `min`, `max`, `minLength` and `maxLength` are read from the error object by those property names. Angular
> documents the error classes but not that shape, so a spec in the kit pins it.

### Labels

`KIT_FORM_LABELS` holds `{ errors: { required, email, min, max, minLength, maxLength, pattern }, fallback }`, with
`KIT_FORM_LABELS_EN` / `KIT_FORM_LABELS_PL` and `provideKitFormLabels()` like every feature (see
[Labels and translations](labels.md)); `provideKitLabels()` wires it with the rest.

## Resetting a form: `resetKitForm()`

`form().reset()` clears what Signal Forms knows (touched, dirty, the values). It doesn't clear what the browser
keeps for itself: the fields the person has been in. An emptied `required` field stays `:user-invalid` — red — until
the native form is reset too.

```ts
protected readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');

protected clear() {
  resetKitForm(this.form, this.formElement(), { oldPassword: '', newPassword: '' });
}
```

`resetKitForm(form, formElement, value?)` takes the `<form>` or its `ElementRef`, resets the native form first
(which empties every control), then the Signal Forms one — so the values of the model, or `value`, are written back.

## A native `<select>` with options from `@for`

A `<select [formField]>` whose options come from `@for` or `[value]` shows its **first** option for a moment: the
options are added after the form wrote the value, and Angular fixes the selection once it sees them, in a
`MutationObserver` callback. In a browser that is before the next paint; in a test it means reading the value right
after `fixture.detectChanges()` gives the first option. `settle()` from [`@jchpro/ngx-kit/testing`](testing.md)
waits for it. Writing the options out by hand doesn't have the delay.
