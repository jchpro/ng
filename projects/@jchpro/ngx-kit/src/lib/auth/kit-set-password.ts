import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { KitBusy } from '../loading/kit-busy.directive';
import { mergeKitLabels } from '../labels/kit-labels';
import { KitAuthCard } from './kit-auth-card';
import { formatKitAuthMessage, KitAuthField, nextKitAuthId } from './kit-auth-form';
import { KIT_AUTH_LABELS, KitAuthLabelsOverride } from './kit-auth-labels';
import { KitPasswordToggle } from './kit-password-toggle';

/** Why the person is choosing a password: after forgetting theirs, or on accepting an invitation. */
export type KitSetPasswordFlow = 'reset' | 'invite';

/** What the person chose in a `KitSetPassword`. */
export interface KitSetPasswordResult {
  password: string;
}

/**
 * Asks for a new password twice and emits `submitted` once they match: the last step of resetting
 * a password and of accepting an invitation, which differ only in their wording (`flow`). The
 * token from the link in the email is the app's to read from the URL and send along with the
 * password.
 *
 * ```html
 * <kit-set-password flow="invite" [minLength]="10" [busy]="busy()" [error]="error()"
 *                   (submitted)="accept($event.password)"></kit-set-password>
 * ```
 *
 * Slots, as attributes on projected elements: `kitAuthLogo`, `kitAuthFields` (more fields above
 * the passwords, e.g. a display name for an invitation) and `kitAuthFooter`.
 */
@Component({
  selector: 'kit-set-password',
  imports: [KitAuthCard, KitPasswordToggle, KitBusy, LucideCircleAlert],
  templateUrl: './kit-set-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitSetPassword {

  readonly #appLabels = inject(KIT_AUTH_LABELS);
  readonly #id = nextKitAuthId('kit-set-password');

  /** Picks the title, description and button wording. */
  readonly flow = input<KitSetPasswordFlow>('reset');

  /** The shortest password accepted, announced under the field. The server stays the authority. */
  readonly minLength = input<number>();

  /** A request is out: the button shows a spinner and the fields are read-only. */
  readonly busy = input(false, { transform: booleanAttribute });

  /** A failure to show above the form, e.g. an expired link or a rejected password. */
  readonly error = input<string | null>();

  /** Overrides labels for this view only, over `KIT_AUTH_LABELS`. */
  readonly labels = input<KitAuthLabelsOverride>();

  readonly submitted = output<KitSetPasswordResult>();

  protected readonly l = computed(() => mergeKitLabels(this.#appLabels(), this.labels()));
  protected readonly flowLabels = computed(() => this.l().setPassword[this.flow()]);

  protected readonly minLengthMessage = computed(() => {
    const min = this.minLength();
    return min ? formatKitAuthMessage(this.l().setPassword.tooShort, { min }) : null;
  });

  readonly #submitAttempted = signal(false);

  protected readonly password = new KitAuthField(value => {
    if (!value) {
      return this.l().common.required;
    }
    if (value.length < (this.minLength() ?? 0)) {
      return this.minLengthMessage();
    }
    return null;
  }, this.#submitAttempted);

  protected readonly confirmation = new KitAuthField(value => {
    if (!value) {
      return this.l().common.required;
    }
    if (value !== this.password.value()) {
      return this.l().setPassword.mismatch;
    }
    return null;
  }, this.#submitAttempted);

  protected readonly passwordId = `${this.#id}-password`;
  protected readonly confirmationId = `${this.#id}-confirmation`;

  /** The line under the password field that describes it: its error, else the length hint. */
  protected readonly passwordDescription = computed(() => {
    if (this.password.shownError()) {
      return `${this.passwordId}-error`;
    }
    return this.minLengthMessage() ? `${this.passwordId}-hint` : null;
  });

  protected submit(event: Event) {
    event.preventDefault();
    if (this.busy()) {
      return;
    }
    const form = event.target as HTMLFormElement;
    // Read from the form, not from what `input` events reported: some autofill never fires them.
    const data = new FormData(form);
    this.password.value.set(String(data.get('password')));
    this.confirmation.value.set(String(data.get('confirmation')));
    this.#submitAttempted.set(true);
    const invalid = this.#firstInvalidField();
    if (invalid) {
      (form.elements.namedItem(invalid) as HTMLElement).focus();
      return;
    }
    this.submitted.emit({ password: this.password.value() });
  }

  /** The `name` of the first field with an error, or `null` when the form is fine. */
  #firstInvalidField(): 'password' | 'confirmation' | null {
    if (this.password.error()) {
      return 'password';
    }
    if (this.confirmation.error()) {
      return 'confirmation';
    }
    return null;
  }

}
