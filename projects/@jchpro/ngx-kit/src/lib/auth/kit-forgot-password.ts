import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { LucideCircleAlert, LucideMailCheck } from '@lucide/angular';
import { KitBusy } from '../loading/kit-busy.directive';
import { mergeKitLabels } from '../labels/kit-labels';
import { KitAuthCard } from './kit-auth-card';
import { formatKitAuthMessage, isKitAuthEmail, KitAuthField, nextKitAuthId } from './kit-auth-form';
import { KIT_AUTH_LABELS, KitAuthLabelsOverride } from './kit-auth-labels';
import { KitIdentifierType } from './kit-auth.types';

/** What the person entered in a `KitForgotPassword`. */
export interface KitForgotPasswordRequest {
  /** The email or username, trimmed. */
  identifier: string;
}

/**
 * Asks for the identifier of the account to send password-reset instructions to, then emits
 * `requested`. The app sends them, and sets `sent` to swap the form for a confirmation that
 * does not reveal whether the account exists.
 *
 * ```html
 * <kit-forgot-password [busy]="busy()" [sent]="sent()" (requested)="send($event)">
 *   <a kitAuthFooter routerLink="/login">Back to sign in</a>
 * </kit-forgot-password>
 * ```
 *
 * Slots, as attributes on projected elements: `kitAuthLogo` and `kitAuthFooter`.
 */
@Component({
  selector: 'kit-forgot-password',
  imports: [KitAuthCard, KitBusy, LucideCircleAlert, LucideMailCheck],
  templateUrl: './kit-forgot-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitForgotPassword {

  readonly #appLabels = inject(KIT_AUTH_LABELS);
  readonly #id = nextKitAuthId('kit-forgot-password');

  /** Whether people identify their account by email or by username. */
  readonly identifierType = input<KitIdentifierType>('email');

  /** A request is out: the button shows a spinner and the field is read-only. */
  readonly busy = input(false, { transform: booleanAttribute });

  /** The instructions were sent: shows the confirmation instead of the form. */
  readonly sent = input(false, { transform: booleanAttribute });

  /** A failure to show above the form, e.g. the request could not be made. */
  readonly error = input<string | null>();

  /** Overrides labels for this view only, over `KIT_AUTH_LABELS`. */
  readonly labels = input<KitAuthLabelsOverride>();

  readonly requested = output<KitForgotPasswordRequest>();

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

  protected readonly identifierId = `${this.#id}-identifier`;

  protected readonly sentMessage = computed(() =>
    formatKitAuthMessage(this.l().forgotPassword.sentMessage, { identifier: this.identifier.value().trim() })
  );

  protected submit(event: Event) {
    event.preventDefault();
    if (this.busy()) {
      return;
    }
    const form = event.target as HTMLFormElement;
    // Read from the form, not from what `input` events reported: some autofill never fires them.
    this.identifier.value.set(String(new FormData(form).get('username')));
    this.#submitAttempted.set(true);
    if (this.identifier.error()) {
      (form.elements.namedItem('username') as HTMLElement).focus();
      return;
    }
    this.requested.emit({ identifier: this.identifier.value().trim() });
  }

}
