import { computed, EnvironmentProviders, InjectionToken, makeEnvironmentProviders, signal, Signal } from '@angular/core';
import { ProBaseLabelsIntl } from './pro-base-intl';

/**
 * Translations for dialog windows handled by {@Link CommonDialogsService}. By default, the translations are in English.
 * Emit a new object on `labels` signal to notify components when the translations have changed for any reason.
 */
export class ProDialogsIntl extends ProBaseLabelsIntl<ProDialogsLabels> {

  readonly labels = signal<ProDialogsLabels>({
    infoTitle: 'Information',
    confirmTitle: 'Confirmation',
    okButton: 'OK',
    confirmButton: 'Confirm',
    cancelButton: 'Cancel',
    yesButton: 'Yes',
    noButton: 'No',
  });

  getLabel(which: keyof ProDialogsLabels): Signal<string> {
    return computed(() => this.labels()[which]);
  }

}

export interface ProDialogsLabels {
  infoTitle: string;
  confirmTitle: string;
  okButton: string;
  confirmButton: string;
  cancelButton: string;
  yesButton: string;
  noButton: string;
}


export const PRO_DIALOGS_INTL = new InjectionToken<ProDialogsIntl>('PRO_DIALOGS_INTL', {
  factory: () => new ProDialogsIntl()
});

/**
 * Provides {@link PRO_DIALOGS_INTL} globally.
 */
export function provideDialogsIntl(intlFactory: () => ProDialogsIntl): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PRO_DIALOGS_INTL,
      useFactory: intlFactory
    }
  ]);
}
