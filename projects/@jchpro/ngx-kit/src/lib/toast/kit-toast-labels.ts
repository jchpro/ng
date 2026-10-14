import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, KitLabelsSource, provideKitLabelsFor } from '../labels/kit-labels';

/** Every user-facing string of the toasts. */
export interface KitToastLabels {
  /** The accessible name of the region the toasts appear in. */
  region: string;
  /** The accessible name of a toast's close button. */
  dismiss: string;
}

/** What `provideKitToastLabels` accepts: any part of the labels, the rest stays as is. */
export type KitToastLabelsOverride = KitLabelsOverride<KitToastLabels>;

export const KIT_TOAST_LABELS_EN: KitToastLabels = {
  region: 'Notifications',
  dismiss: 'Dismiss'
};

export const KIT_TOAST_LABELS_PL: KitToastLabels = {
  region: 'Powiadomienia',
  dismiss: 'Zamknij'
};

/**
 * The labels the toasts read, as a signal so they can follow a runtime language switch.
 * English unless overridden with `provideKitToastLabels` or `provideKitLabels`.
 */
export const KIT_TOAST_LABELS = new InjectionToken<Signal<KitToastLabels>>('KIT_TOAST_LABELS', {
  factory: () => signal(KIT_TOAST_LABELS_EN).asReadonly()
});

/**
 * App-wide override of the toast labels, merged over the English defaults. A signal works for
 * labels that change at runtime (e.g. fed from your i18n library).
 */
export function provideKitToastLabels(labels: KitLabelsSource<KitToastLabelsOverride>): Provider {
  return provideKitLabelsFor(KIT_TOAST_LABELS, KIT_TOAST_LABELS_EN, labels);
}
