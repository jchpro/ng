import { computed, inject, InjectionToken, isSignal, Provider, signal, Signal } from '@angular/core';
import { KIT_AUTH_LABELS_EN, KIT_AUTH_LABELS_PL, provideKitAuthLabels } from '../auth/kit-auth-labels';
import { KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL, provideKitDialogLabels } from '../dialog/kit-dialog-labels';
import { KIT_FORM_LABELS_EN, KIT_FORM_LABELS_PL, provideKitFormLabels } from '../forms/kit-form-labels';
import { KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL, provideKitShellLabels } from '../shell/kit-shell-labels';
import { KIT_TABLE_LABELS_EN, KIT_TABLE_LABELS_PL, provideKitTableLabels } from '../table/kit-table-labels';
import { KIT_TOAST_LABELS_EN, KIT_TOAST_LABELS_PL, provideKitToastLabels } from '../toast/kit-toast-labels';
import { KitLabelsSource, resolveKitLabelsSource } from './kit-labels';

export type KitLanguage = 'en' | 'pl';

/** The language `provideKitLabels()` was given, as a signal: resolved once, so every feature shares it. */
const KIT_LABELS_LANGUAGE = new InjectionToken<Signal<KitLanguage>>('KIT_LABELS_LANGUAGE');

/**
 * One-call language for every built-in string of the kit. English is the default, so this is
 * for switching to Polish; use the per-feature `provideKitXLabels` to override single strings
 * or to feed labels from your own i18n library.
 *
 * Pass a signal for a language that changes at runtime: every feature follows it. When the language
 * lives in a service, pass a factory run in an injection context, which can `inject()` it:
 * `provideKitLabels(() => inject(LanguageService).language)`.
 *
 * Providers are applied in order, so put `provideKitLabels(...)` before any per-feature override.
 */
export function provideKitLabels(language: KitLabelsSource<KitLanguage>): Provider[] {
  // Each feature picks its set from the shared language, when its labels are first injected.
  const pick = <T>(en: T, pl: T) => () => {
    const current = inject(KIT_LABELS_LANGUAGE);
    return computed(() => current() === 'pl' ? pl : en);
  };
  return [
    {
      provide: KIT_LABELS_LANGUAGE,
      useFactory: () => {
        const source = resolveKitLabelsSource(language);
        return isSignal(source) ? source : signal(source).asReadonly();
      }
    },
    provideKitAuthLabels(pick(KIT_AUTH_LABELS_EN, KIT_AUTH_LABELS_PL)),
    provideKitDialogLabels(pick(KIT_DIALOG_LABELS_EN, KIT_DIALOG_LABELS_PL)),
    provideKitFormLabels(pick(KIT_FORM_LABELS_EN, KIT_FORM_LABELS_PL)),
    provideKitShellLabels(pick(KIT_SHELL_LABELS_EN, KIT_SHELL_LABELS_PL)),
    provideKitTableLabels(pick(KIT_TABLE_LABELS_EN, KIT_TABLE_LABELS_PL)),
    provideKitToastLabels(pick(KIT_TOAST_LABELS_EN, KIT_TOAST_LABELS_PL))
  ];
}
