import { Provider } from '@angular/core';
import { KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL, provideKitDialogLabels } from '../dialog/kit-dialog-labels';
import { KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL, provideKitShellLabels } from '../shell/kit-shell-labels';

export type KitLanguage = 'en' | 'pl';

/**
 * One-call language for every built-in string of the kit. English is the default, so this is
 * for switching to Polish; use the per-feature `provideKitXLabels` to override single strings
 * or to feed labels from your own i18n library.
 *
 * Providers are applied in order, so put `provideKitLabels(...)` before any per-feature override.
 */
export function provideKitLabels(language: KitLanguage): Provider[] {
  const pl = language === 'pl';
  return [
    provideKitDialogLabels(pl ? KIT_DIALOG_LABELS_PL : KIT_DIALOG_LABELS_EN),
    provideKitShellLabels(pl ? KIT_SHELL_LABELS_PL : KIT_SHELL_LABELS_EN)
  ];
}
