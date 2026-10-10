import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, provideKitLabelsFor } from '../labels/kit-labels';

/**
 * The messages of `<kit-field-error>`, one per kind of Signal Forms validation error.
 * `{min}` and `{max}` are replaced with the limit of the error (the length for `minLength` and `maxLength`).
 */
export interface KitFormLabels {
  errors: {
    required: string;
    email: string;
    min: string;
    max: string;
    minLength: string;
    maxLength: string;
    pattern: string;
  };
  /** For an error of a kind without a message of its own, which has no `message` either. */
  fallback: string;
}

/** What `provideKitFormLabels` accepts: any part of the labels, the rest stays as is. */
export type KitFormLabelsOverride = KitLabelsOverride<KitFormLabels>;

export const KIT_FORM_LABELS_EN: KitFormLabels = {
  errors: {
    required: 'This field is required.',
    email: 'Enter a valid email address.',
    min: 'Enter a value of at least {min}.',
    max: 'Enter a value of at most {max}.',
    minLength: 'Enter at least {min} characters.',
    maxLength: 'Enter at most {max} characters.',
    pattern: 'The value is in the wrong format.'
  },
  fallback: 'The value is not valid.'
};

export const KIT_FORM_LABELS_PL: KitFormLabels = {
  errors: {
    required: 'To pole jest wymagane.',
    email: 'Podaj poprawny adres e-mail.',
    min: 'Podaj wartość nie mniejszą niż {min}.',
    max: 'Podaj wartość nie większą niż {max}.',
    minLength: 'Minimalna liczba znaków: {min}.',
    maxLength: 'Maksymalna liczba znaków: {max}.',
    pattern: 'Wartość ma niepoprawny format.'
  },
  fallback: 'Wartość jest niepoprawna.'
};

/**
 * The labels the forms parts read, as a signal so they can follow a runtime language switch.
 * English unless overridden with `provideKitFormLabels` or `provideKitLabels`.
 */
export const KIT_FORM_LABELS = new InjectionToken<Signal<KitFormLabels>>('KIT_FORM_LABELS', {
  factory: () => signal(KIT_FORM_LABELS_EN).asReadonly()
});

/**
 * App-wide override of the forms labels, merged over the English defaults. A signal works for
 * labels that change at runtime (e.g. fed from your i18n library).
 */
export function provideKitFormLabels(labels: KitFormLabelsOverride | Signal<KitFormLabelsOverride>): Provider {
  return provideKitLabelsFor(KIT_FORM_LABELS, KIT_FORM_LABELS_EN, labels);
}
