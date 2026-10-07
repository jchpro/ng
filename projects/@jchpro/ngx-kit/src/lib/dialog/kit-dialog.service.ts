import { ComponentType } from '@angular/cdk/overlay';
import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { KIT_DIALOG_LABELS } from './kit-dialog-labels';
import { KitDialogRef } from './kit-dialog-ref';
import { KitAlertOptions, KitConfirmOptions, KitDialogConfig } from './kit-dialog.types';
import { KitMessageDialog, KitMessageDialogData } from './kit-message-dialog';

/**
 * Opens dialogs with the kit's look (CDK `Dialog` underneath), and answers with Promises.
 *
 * - `alert()` tells the user something and resolves when it's acknowledged;
 * - `confirm()` asks a question and resolves `true` or `false` — dismissing it (Escape,
 *   backdrop, navigating away) counts as `false`;
 * - `open()` shows a component of your own, laid out with the `kit-dialog` classes.
 *
 * None of them ever reject. Titles and button labels come from `KIT_DIALOG_LABELS` unless
 * the call passes its own.
 */
@Injectable({ providedIn: 'root' })
export class KitDialogService {

  readonly #dialog = inject(Dialog);
  readonly #labels = inject(KIT_DIALOG_LABELS);

  /**
   * Opens `component` in a dialog. It reads the config's `data` through `DIALOG_DATA` and can
   * close itself with `inject(DialogRef).close(result)` or a `kitDialogClose` button; the
   * returned ref's `result` resolves with it, or `undefined` if the dialog was dismissed.
   */
  open<R = unknown, D = unknown, C = unknown>(component: ComponentType<C>, config: KitDialogConfig<D> = {}): KitDialogRef<R, C> {
    const ref = this.#dialog.open<R, D, C>(component, {
      data: config.data,
      injector: config.injector,
      role: config.role ?? 'dialog',
      disableClose: config.disableClose ?? false,
      autoFocus: config.autoFocus ?? 'first-tabbable',
      hasBackdrop: true,
      backdropClass: 'kit-dialog-backdrop',
      panelClass: ['kit-dialog-panel', `kit-dialog-panel--${config.size ?? 'md'}`, ...toArray(config.panelClass)],
      // The CDK's default is 80vw, which would leave a phone with a narrow strip of dialog.
      // `.kit-dialog` caps its own width to the viewport minus a margin instead.
      maxWidth: '100vw',
      ariaModal: true,
      restoreFocus: true,
      closeOnNavigation: true
    });
    return new KitDialogRef(ref);
  }

  /** Shows `options.message` with a single button, and resolves once it's dismissed. */
  async alert(options: KitAlertOptions): Promise<void> {
    const labels = this.#labels();
    const tone = options.tone ?? 'info';
    await this.#openMessage({
      tone,
      title: options.title ?? labels.titles[tone],
      message: options.message,
      confirmLabel: options.buttonLabel ?? labels.buttons[options.buttons ?? 'ok']
    });
  }

  /** Asks `options.message` and resolves `true` if confirmed, `false` if cancelled or dismissed. */
  async confirm(options: KitConfirmOptions): Promise<boolean> {
    const labels = this.#labels();
    const tone = options.tone ?? 'info';
    const yesNo = options.buttons === 'yes-no';
    const result = await this.#openMessage({
      tone,
      title: options.title ?? labels.titles[tone],
      message: options.message,
      confirmLabel: options.confirmLabel ?? (yesNo ? labels.buttons.yes : labels.buttons.ok),
      cancelLabel: options.cancelLabel ?? (yesNo ? labels.buttons.no : labels.buttons.cancel)
    });
    return result === true;
  }

  #openMessage(data: KitMessageDialogData): Promise<boolean | undefined> {
    return this.open<boolean, KitMessageDialogData, KitMessageDialog>(KitMessageDialog, {
      data,
      size: 'sm',
      role: data.tone === 'danger' || data.tone === 'error' ? 'alertdialog' : 'dialog'
    }).result;
  }

}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
