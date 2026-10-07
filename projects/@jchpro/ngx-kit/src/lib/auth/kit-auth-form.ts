import { computed, Signal, signal } from '@angular/core';
import { formatKitLabel } from '../labels/kit-labels';

let nextId = 0;

/** A DOM id for an auth view, unique across instances: `kit-login-3`. */
export function nextKitAuthId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

/** Replaces each `{name}` in `template` with its value, e.g. the `{min}` of a length message. */
export function formatKitAuthMessage(template: string, values: Record<string, string | number>): string {
  return formatKitLabel(template, values);
}

/** Loose on purpose — the server decides what an address is; this only catches a typo. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

export function isKitAuthEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/**
 * One field of an auth form: its value, whether the person has left it, and its error. The error
 * is only *shown* once the field was touched or the whole form was submitted, so a form never
 * opens full of red.
 *
 * Internal to the auth views.
 */
export class KitAuthField {

  readonly value = signal('');
  readonly error: Signal<string | null>;
  readonly shownError: Signal<string | null>;

  readonly #touched = signal(false);

  /**
   * @param validate the error message for a value, or `null` when it is fine; may read signals
   * @param submitted whether the form was submitted, which reveals every error at once
   */
  constructor(validate: (value: string) => string | null, submitted: Signal<boolean>) {
    this.error = computed(() => validate(this.value()));
    this.shownError = computed(() => this.#touched() || submitted() ? this.error() : null);
  }

  touch() {
    this.#touched.set(true);
  }

  update(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

}
