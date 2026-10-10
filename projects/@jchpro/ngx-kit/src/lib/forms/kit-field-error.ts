import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { LucideCircleAlert } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KIT_FORM_LABELS } from './kit-form-labels';

/**
 * The first validation error of a Signal Forms field, as the `kit-field__error` line under a control, once the
 * field has been touched (the person left it, or tried to submit). Nothing is rendered while there is no error to show.
 *
 * ```html
 * <input class="kit-field__control" [formField]="form.name" aria-describedby="name-error">
 * <kit-field-error id="name-error" [field]="form.name" />
 * ```
 *
 * The text comes from `KIT_FORM_LABELS` by the `kind` of the error (`required`, `email`, `min`, `max`, `minLength`,
 * `maxLength`, `pattern`), with `{min}` and `{max}` taken from the error. For a custom kind pass `[messages]`; a kind
 * known to neither falls back to the `message` of the error, then to a generic text.
 */
@Component({
  selector: 'kit-field-error',
  imports: [LucideCircleAlert],
  template: `
    @if (error(); as error) {
      <svg lucideCircleAlert></svg>{{ error.text }}
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.kit-field__error]': '!!error()'
  }
})
export class KitFieldError {

  readonly #labels = inject(KIT_FORM_LABELS);

  /** The field whose error is shown. */
  readonly field = input.required<FieldTree<unknown>>();

  /** Messages by error `kind`, over the built-in ones: for custom validators, or to reword a built-in one. */
  readonly messages = input<Readonly<Record<string, string>>>({});

  protected readonly error = computed(() => {
    const state = this.field()();
    const error = state.touched() ? state.errors()[0] : undefined;
    if (!error) {
      return null;
    }
    const labels = this.#labels();
    const builtIn = labels.errors as Record<string, string>;
    const own = (messages: Readonly<Record<string, string>>) => Object.hasOwn(messages, error.kind) ? messages[error.kind] : undefined;
    // The limit is carried under a name of its own (`min`, `max`, `minLength`, `maxLength`): Angular documents the
    // classes, not these properties, so a spec pins them
    const limits = error as unknown as Record<string, unknown>;
    const min = limits['minLength'] ?? limits['min'];
    const max = limits['maxLength'] ?? limits['max'];
    const template = own(this.messages()) ?? own(builtIn) ?? error.message ?? labels.fallback;
    return { text: formatKitLabel(template, { ...(min === undefined ? {} : { min: String(min) }), ...(max === undefined ? {} : { max: String(max) }) }) };
  });

}
