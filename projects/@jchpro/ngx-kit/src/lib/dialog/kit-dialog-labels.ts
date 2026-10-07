import { InjectionToken, Provider, signal, Signal } from '@angular/core';
import { KitLabelsOverride, provideKitLabelsFor } from '../labels/kit-labels';
import { KitDialogTone } from './kit-dialog.types';

/** Every user-facing string of the kit's built-in dialogs. */
export interface KitDialogLabels {
  /** Title a dialog gets when none is passed, by tone. */
  titles: Record<KitDialogTone, string>;
  buttons: {
    ok: string;
    cancel: string;
    yes: string;
    no: string;
    close: string;
  };
}

/** What `provideKitDialogLabels` accepts: any part of the labels, the rest stays as is. */
export type KitDialogLabelsOverride = KitLabelsOverride<KitDialogLabels>;

export const KIT_DIALOG_LABELS_EN: KitDialogLabels = {
  titles: {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    danger: 'Are you sure?',
    error: 'Something went wrong'
  },
  buttons: {
    ok: 'OK',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    close: 'Close'
  }
};

export const KIT_DIALOG_LABELS_PL: KitDialogLabels = {
  titles: {
    info: 'Informacja',
    success: 'Sukces',
    warning: 'Ostrzeżenie',
    danger: 'Czy na pewno?',
    error: 'Wystąpił błąd'
  },
  buttons: {
    ok: 'OK',
    cancel: 'Anuluj',
    yes: 'Tak',
    no: 'Nie',
    close: 'Zamknij'
  }
};

/**
 * The labels the built-in dialogs read, as a signal so they can follow a runtime language
 * switch. English unless overridden with `provideKitDialogLabels` or `provideKitLabels`.
 */
export const KIT_DIALOG_LABELS = new InjectionToken<Signal<KitDialogLabels>>('KIT_DIALOG_LABELS', {
  factory: () => signal(KIT_DIALOG_LABELS_EN).asReadonly()
});

/**
 * App-wide override of the dialog labels, merged over the English defaults — pass only what
 * differs, or a complete set such as `KIT_DIALOG_LABELS_PL`. A signal works for labels that
 * change at runtime (e.g. fed from your i18n library).
 */
export function provideKitDialogLabels(labels: KitDialogLabelsOverride | Signal<KitDialogLabelsOverride>): Provider {
  return provideKitLabelsFor(KIT_DIALOG_LABELS, KIT_DIALOG_LABELS_EN, labels);
}
