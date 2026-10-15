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
| `minItems` | Add at least {min} items. | `{min}` is the number of items |
| `maxItems` | Add at most {max} items. | `{max}` is the number of items |
| `pattern` | The value is in the wrong format. | |

`minItems` and `maxItems` aren't kinds Angular reports: it reports `minLength` and `maxLength` for a list too. When the value
of the field is an array (`<kit-chip-input>`, a group of checkboxes), those two read these texts, so a limit on the number of
chips doesn't talk about characters. `[messages]` is still by the kind Angular reports, `maxLength`.

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

## A list of short texts: `<kit-chip-input>`

Many short texts at once (tasks, tags, emails): type one, press Enter, get a removable chip. The value is a `string[]`.

```html
<label class="kit-field__label" for="tasks">Tasks</label>
<kit-chip-input inputId="tasks" ariaLabel="Tasks" placeholder="Add a task" [formField]="form.tasks" />
<kit-field-error [field]="form.tasks" />
```

- **Adding.** Enter and the comma (`[separators]`, `KeyboardEvent.key` values) turn the typed text into a chip. A pasted text with
  line breaks, or with a one-character separator in it, becomes one chip per piece. The text is trimmed, an empty one isn't added.
  An Enter in an empty field isn't taken, so it still submits a form; a comma in an empty field isn't typed. With `addOnBlur` the
  text left in the field when it loses the focus is added too, so it isn't lost on the way to the save button.
- **Removing.** A chip's button, or Backspace in an empty field, which removes the last chip. After a button the focus returns to
  the text field.
- **No validation in it.** Duplicates, a limit on the number of chips, a text that is too long: validators on the field, shown by
  `<kit-field-error>` under the chips. The component never refuses a chip, since one that vanishes without a word is worse than a
  message. `maxlength` limits what is typed; a longer piece that is pasted is added as it is, the validator tells.
- **Screen readers.** The chips are a list, each remove button is named with the text ("Remove Write the intro"), and adding or
  removing is said in a polite live region ("Added Write the intro"). The texts are `KIT_FORM_LABELS.chipInput`, EN and PL.
- A Signal Forms control (`FormValueControl<string[]>`): `[formField]` binds a `string[]` field and keeps `disabled`, `readonly`
  and `invalid` in sync; without Signal Forms it is `[(value)]`. A `<label for>` can't point at a custom element, so `inputId`
  goes on the text field inside. Without a chip input, the `kit-chips` classes are the look alone,
  see [Primitives](primitives.md).

## An optional color: `<kit-color-field>`

A native `<input type="color">` can't be empty, it shows black. For a color that is optional the form has to tell
"black" from "nothing chosen". `<kit-color-field>` is the swatch (the Field's own `input[type=color]`, dimmed while
unset) with the hex value next to it, or the italic "not set" text, and with `clearable` a ghost button that puts it
back to unset. The value is `string | null`, `null` when unset (an empty string counts as unset too).

```html
<label class="kit-field__label" for="accent">Accent color</label>
<kit-color-field inputId="accent" clearable placeholder="Inherited from the theme" [formField]="form.accent" />
```

It is a Signal Forms control (`FormValueControl<string | null>`), so `[formField]` binds a `string | null` field to it
and keeps `disabled`, `readonly` and `invalid` in sync; without Signal Forms it is `[(value)]`. A `<label for>` can't
point at a custom element, so `inputId` goes on the swatch inside; without a visible label give it an `ariaLabel`.
"Not set" and the clear button's name come from `KIT_FORM_LABELS` (`colorField`, EN and PL), `placeholder` replaces the
first one. Include `./styles/color-field` on its own, or via `primitives`.

## A group of checkboxes bound to an array: `kitCheckGroup`

Signal Forms binds one checkbox to a boolean. A group of options bound to a `string[]` (roles, tags) took a
`[checked]="roles().includes(role)" (change)="toggle(role)"` pair on every option. `kitCheckGroup` is that pair:

```html
@for (role of roles; track role.id) {
  <label class="kit-check">
    <input class="kit-check__input" type="checkbox" [kitCheckGroup]="form.roles().value" [kitCheckValue]="role.id">
    <span>{{ role.name }} <span class="kit-check__note">{{ role.note }}</span></span>
  </label>
}
```

`[kitCheckGroup]` takes any writable signal of an array: a `signal<string[]>()`, or the `value` of a Signal Forms
field. The input is checked while `[kitCheckValue]` is in the array; changing it adds the value (at the end) or removes it.
The array is replaced, not changed in place, and values are compared with `===`. `kit-check__note` is the muted
explanation after the option's text; keep both in one `<span>`, or the label's flex layout makes the note a column of its own.

## A native `<select>` with options from `@for`

A `<select [formField]>` whose options come from `@for` or `[value]` shows its **first** option for a moment: the
options are added after the form wrote the value, and Angular fixes the selection once it sees them, in a
`MutationObserver` callback. In a browser that is before the next paint; in a test it means reading the value right
after `fixture.detectChanges()` gives the first option. `settle()` from [`@jchpro/ngx-kit/testing`](testing.md)
waits for it. Writing the options out by hand doesn't have the delay.
