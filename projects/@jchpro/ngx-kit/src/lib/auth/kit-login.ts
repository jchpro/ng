import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { KitBusy } from '../loading/kit-busy.directive';
import { mergeKitLabels } from '../labels/kit-labels';
import { KitAuthCard } from './kit-auth-card';
import { isKitAuthEmail, KitAuthField, nextKitAuthId } from './kit-auth-form';
import { KIT_AUTH_LABELS, KitAuthLabelsOverride } from './kit-auth-labels';
import { KitIdentifierType } from './kit-auth.types';
import { KitPasswordToggle } from './kit-password-toggle';

/** What the person entered in a `KitLogin`. */
export interface KitLoginCredentials {
  /** The email or username, trimmed. */
  identifier: string;
  password: string;
  /** Whether the "remember me" box was ticked; `false` when the box isn't shown. */
  remember: boolean;
}

/**
 * The sign-in form. It validates that both fields are filled (and the identifier looks like an
 * email, if it is one), then emits `submitted`; making the request is up to the app, which
 * feeds the outcome back through `busy` and `error`.
 *
 * ```html
 * <kit-login [busy]="busy()" [error]="error()" (submitted)="signIn($event)">
 *   <img kitAuthLogo src="logo.svg" alt="">
 *   <a kitAuthActions routerLink="/forgot-password">Forgot your password?</a>
 * </kit-login>
 * ```
 *
 * Slots, as attributes on projected elements: `kitAuthLogo`, `kitAuthActions` (right below the
 * button: a link, single-sign-on buttons) and `kitAuthFooter`. For a form of your own, e.g. on
 * signal forms, compose the same look from `KitAuthCard` and `KitPasswordToggle`.
 */
@Component({
  selector: 'kit-login',
  imports: [KitAuthCard, KitPasswordToggle, KitBusy, LucideCircleAlert],
  templateUrl: './kit-login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitLogin {

  readonly #appLabels = inject(KIT_AUTH_LABELS);
  readonly #id = nextKitAuthId('kit-login');

  /** Whether people sign in with an email or a username. */
  readonly identifierType = input<KitIdentifierType>('email');

  /** Shows the "remember me" checkbox. */
  readonly showRememberMe = input(false, { transform: booleanAttribute });

  /** A request is out: the button shows a spinner and the fields are read-only. */
  readonly busy = input(false, { transform: booleanAttribute });

  /** A failure to show above the form, e.g. wrong credentials. */
  readonly error = input<string | null>();

  /** Overrides labels for this view only, over `KIT_AUTH_LABELS`. */
  readonly labels = input<KitAuthLabelsOverride>();

  readonly submitted = output<KitLoginCredentials>();

  protected readonly l = computed(() => mergeKitLabels(this.#appLabels(), this.labels()));
  protected readonly identifierLabel = computed(() => this.l().common.identifier[this.identifierType()]);

  readonly #submitAttempted = signal(false);

  protected readonly identifier = new KitAuthField(value => {
    if (!value.trim()) {
      return this.l().common.required;
    }
    if (this.identifierType() === 'email' && !isKitAuthEmail(value.trim())) {
      return this.l().common.invalidEmail;
    }
    return null;
  }, this.#submitAttempted);

  protected readonly password = new KitAuthField(
    value => value ? null : this.l().common.required,
    this.#submitAttempted
  );

  protected readonly identifierId = `${this.#id}-identifier`;
  protected readonly passwordId = `${this.#id}-password`;

  protected submit(event: Event) {
    event.preventDefault();
    if (this.busy()) {
      return;
    }
    const form = event.target as HTMLFormElement;
    // Read from the form, not from what `input` events reported: some autofill never fires them.
    const data = new FormData(form);
    this.identifier.value.set(String(data.get('username')));
    this.password.value.set(String(data.get('password')));
    this.#submitAttempted.set(true);
    const invalid = this.#firstInvalidField();
    if (invalid) {
      (form.elements.namedItem(invalid) as HTMLElement).focus();
      return;
    }
    this.submitted.emit({
      identifier: this.identifier.value().trim(),
      password: this.password.value(),
      remember: data.has('remember')
    });
  }

  /** The `name` of the first field with an error, or `null` when the form is fine. */
  #firstInvalidField(): 'username' | 'password' | null {
    if (this.identifier.error()) {
      return 'username';
    }
    if (this.password.error()) {
      return 'password';
    }
    return null;
  }

}
