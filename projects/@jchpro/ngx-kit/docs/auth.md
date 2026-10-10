[← back to readme](../readme.md)

# Auth views

The views for an app with **local** sign-in: sign in, ask for a password reset, and choose a
password (after a reset, or on accepting an invitation). The kit renders and validates them; it
does no authentication. Each view emits what the person entered, and **you** make the request,
read the token from the URL and navigate. No routing, no `HttpClient`, no `@angular/forms`.

Two layers, the components built on the pieces:

| | |
|---|---|
| **Views** | `KitLogin`, `KitForgotPassword`, `KitSetPassword`: a complete form each, nothing to wire but `(submitted)`. |
| **Pieces** | `KitAuthCard`, `KitPasswordToggle`, `KitIcon` and the `.kit-auth-*` / `.kit-field` / `.kit-btn` classes, to build a form of your own (e.g. on signal forms) with the same look. |

## Setup

```scss
@use '@jchpro/ngx-kit/styles/auth';
@include auth.classes();   // or just `primitives.classes()`, which includes it
```

The views also need the field, button and check classes: `primitives.classes()` has them all.
Centering the card in the viewport is `.kit-auth-page`, on a wrapper or on the routed
component's host. Inside a [shell](layout.md) the content area drops its padding for a direct `.kit-auth-page` child, so
the page isn't pushed past the viewport.

## Sign in

```ts
@Component({
  imports: [KitLogin, RouterLink],
  host: { class: 'kit-auth-page' },
  template: `
    <kit-login [busy]="busy()" [error]="error()" showRememberMe (submitted)="signIn($event)">
      <img kitAuthLogo src="logo.svg" alt="">
      <a kitAuthActions routerLink="/forgot-password">Forgot your password?</a>
    </kit-login>`
})
export class LoginPage {
  busy = signal(false);
  error = signal<string | null>(null);

  async signIn({ identifier, password, remember }: KitLoginCredentials) {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.auth.signIn(identifier, password, remember);
      await this.router.navigateByUrl('/');
    } catch {
      this.error.set('Wrong email or password');
    } finally {
      this.busy.set(false);
    }
  }
}
```

| Input | |
|---|---|
| `identifierType` | `'email'` (default) or `'username'`: picks the label, the input `type`, `inputmode`, and whether the value must look like an address. `autocomplete="username"` either way. |
| `showRememberMe` | Shows the "remember me" checkbox. `remember` in the output is `false` without it. |
| `busy` | A request is out: the button shows a spinner (and keeps focus), the fields are read-only and a submit is ignored. |
| `error` | A failure to show above the form. It lives in an always-present `role="alert"` region, so setting it is announced. |
| `labels` | Overrides labels for this one view. See [labels](#labels). |

Empty fields (and a malformed email) are caught by the kit: nothing is emitted, every error is
shown, and focus goes to the first invalid field. Errors only appear once a field was left or
the form was submitted. Values are read from the form on submit, so autofill that fires no
`input` event still works.

## Forgot password

```html
<kit-forgot-password [busy]="busy()" [sent]="sent()" (requested)="send($event.identifier)">
  <a kitAuthFooter routerLink="/login">Back to sign in</a>
</kit-forgot-password>
```

Emits `requested` with the identifier. When your request is done, set `sent`: the form is
replaced by a confirmation ("If an account exists for …") that says nothing about whether the
account does exist. Inputs: `identifierType`, `busy`, `sent`, `error`, `labels`.

## Set password

```html
<!-- /reset-password?token=… -->
<kit-set-password flow="reset" [minLength]="10" [busy]="busy()" [error]="error()"
                  (submitted)="reset($event.password)" />

<!-- /invitation?token=… -->
<kit-set-password flow="invite" [busy]="busy()" (submitted)="accept($event.password)">
  <div kitAuthFields class="kit-field">…a display name field of your own…</div>
</kit-set-password>
```

Asks for the password twice and emits `submitted` once they match. Resetting and accepting an
invitation are the same form, so `flow` (`'reset'` default, or `'invite'`) only picks the wording.
`minLength` is announced under the field and enforced client-side; the server stays the
authority, and what it rejects goes back through `error`. Fields projected as `kitAuthFields`
sit inside the form above the passwords, and their values are yours to read.

Inputs: `flow`, `minLength`, `busy`, `error`, `labels`.

## Slots

Attributes on projected elements:

| Slot | In | |
|---|---|---|
| `kitAuthLogo` | all | Above the heading. |
| `kitAuthActions` | `KitLogin` | Right under the button: a link, single-sign-on buttons. |
| `kitAuthFields` | `KitSetPassword` | Extra fields above the passwords. |
| `kitAuthFooter` | all | Below the form: a link to another view, terms. |

## Labels

All strings (including the show/hide password button's accessible name) are in one feature,
`KIT_AUTH_LABELS`, grouped as `common`, `login`, `forgotPassword` and `setPassword`
(`reset` and `invite`), with `provideKitAuthLabels()` and `KIT_AUTH_LABELS_EN|PL`; the
`provideKitLabels('pl')` switch covers it. Two messages carry a placeholder the view fills in:
`{min}` (`setPassword.tooShort`) and `{identifier}` (`forgotPassword.sentMessage`). See
[labels](labels.md).

```ts
provideKitAuthLabels({ login: { title: 'Welcome back' }, setPassword: { invite: { submit: 'Join' } } })
```

## Your own form: the pieces

When the form is yours, say on signal forms, use the card and the classes, and the kit doesn't
touch your model:

```ts
@Component({
  imports: [KitAuthCard, KitPasswordToggle, KitBusy, FormField, FormRoot],
  template: `
    <kit-auth-card heading="Sign in" [error]="error()" [kitBusy]="f().submitting()">
      <form class="kit-auth-form" [formRoot]="f">
        <div class="kit-field">
          <label class="kit-field__label" for="email">Email</label>
          <input class="kit-field__control" id="email" type="email" autocomplete="username" [formField]="f.email">
        </div>
        <div class="kit-field">
          <label class="kit-field__label" for="password">Password</label>
          <kit-password-toggle>
            <input class="kit-field__control" id="password" type="password" autocomplete="current-password" [formField]="f.password">
          </kit-password-toggle>
        </div>
        <button class="kit-btn kit-btn--primary kit-btn--lg">Sign in</button>
      </form>
    </kit-auth-card>`
})
```

- **`KitAuthCard`**: the card, `heading` (the page's `<h1>`), `description`, `error`, and the
  `kitAuthLogo` / `kitAuthFooter` slots. Put `[kitBusy]` on it to cover it while a request is out.
- **`KitPasswordToggle`**: adds a show/hide button to the native input inside it by flipping
  its `type`, so it works with any way of binding the input. Replace either built-in icon by
  projecting any element marked `kitIcon="show"` or `kitIcon="hide"`; `showLabel` / `hideLabel`
  override the button's accessible name for one instance.
- **`KitIcon`**: the `[kitIcon]` marker. The kit's pattern for letting you swap a built-in icon for
  one from another icon library, an inline SVG, an emoji.
- **Classes**: `.kit-auth-page`, `.kit-auth-form` (`__actions`), `.kit-auth-notice`
  (`--success`) for a message that replaces a form, and the field, check and button classes
  from [primitives](primitives.md). Show an error with `aria-invalid="true"` on the control and a
  `.kit-field__error` line linked through `aria-describedby`.
