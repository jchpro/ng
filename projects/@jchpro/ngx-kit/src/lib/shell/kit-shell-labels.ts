import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, provideKitLabelsFor } from '../labels/kit-labels';

/** Every user-facing string of the layout shell. */
export interface KitShellLabels {
  /** Accessible name of the header's button that opens and closes the sidenav on small screens. */
  toggleNavigation: string;
}

/** What `provideKitShellLabels` accepts: any part of the labels, the rest stays as is. */
export type KitShellLabelsOverride = KitLabelsOverride<KitShellLabels>;

export const KIT_SHELL_LABELS_EN: KitShellLabels = {
  toggleNavigation: 'Toggle navigation'
};

export const KIT_SHELL_LABELS_PL: KitShellLabels = {
  toggleNavigation: 'Przełącz nawigację'
};

/**
 * The labels the shell reads, as a signal so they can follow a runtime language switch.
 * English unless overridden with `provideKitShellLabels` or `provideKitLabels`.
 */
export const KIT_SHELL_LABELS = new InjectionToken<Signal<KitShellLabels>>('KIT_SHELL_LABELS', {
  factory: () => signal(KIT_SHELL_LABELS_EN).asReadonly()
});

/**
 * App-wide override of the shell labels, merged over the English defaults. A signal works for
 * labels that change at runtime (e.g. fed from your i18n library).
 */
export function provideKitShellLabels(labels: KitShellLabelsOverride | Signal<KitShellLabelsOverride>): Provider {
  return provideKitLabelsFor(KIT_SHELL_LABELS, KIT_SHELL_LABELS_EN, labels);
}
