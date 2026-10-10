import { computed, isSignal, Provider, Signal } from '@angular/core';
import { KIT_AUTH_LABELS_EN, KIT_AUTH_LABELS_PL, provideKitAuthLabels } from '../auth/kit-auth-labels';
import { KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL, provideKitDialogLabels } from '../dialog/kit-dialog-labels';
import { KIT_FORM_LABELS_EN, KIT_FORM_LABELS_PL, provideKitFormLabels } from '../forms/kit-form-labels';
import { KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL, provideKitShellLabels } from '../shell/kit-shell-labels';
import { KIT_TABLE_LABELS_EN, KIT_TABLE_LABELS_PL, provideKitTableLabels } from '../table/kit-table-labels';

export type KitLanguage = 'en' | 'pl';

/**
 * One-call language for every built-in string of the kit. English is the default, so this is
 * for switching to Polish; use the per-feature `provideKitXLabels` to override single strings
 * or to feed labels from your own i18n library.
 *
 * Pass a signal for a language that changes at runtime: every feature follows it.
 *
 * Providers are applied in order, so put `provideKitLabels(...)` before any per-feature override.
 */
export function provideKitLabels(language: KitLanguage | Signal<KitLanguage>): Provider[] {
  const pick = <T>(en: T, pl: T): T | Signal<T> => isSignal(language)
    ? computed(() => language() === 'pl' ? pl : en)
    : language === 'pl' ? pl : en;
  return [
    provideKitAuthLabels(pick(KIT_AUTH_LABELS_EN, KIT_AUTH_LABELS_PL)),
    provideKitDialogLabels(pick(KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL)),
    provideKitFormLabels(pick(KIT_FORM_LABELS_EN, KIT_FORM_LABELS_PL)),
    provideKitShellLabels(pick(KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL)),
    provideKitTableLabels(pick(KIT_TABLE_LABELS_EN, KIT_TABLE_LABELS_PL))
  ];
}
