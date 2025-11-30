import { inject, Injectable, isSignal } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { PRO_DIALOGS_INTL } from '../intl/pro-dialogs-intl';
import { CommonDialog } from './common/common-dialog';
import { CommonDialogButton, CommonDialogData, ConfirmDialogButtonSet, ConfirmDialogData, InfoDialogData } from './types';

@Injectable({
  providedIn: 'root',
})
export class CommonDialogsService {

  protected readonly matDialog = inject(MatDialog);

  readonly #intl = inject(PRO_DIALOGS_INTL);

  info(data: InfoDialogData, extraConfig?: MatDialogConfigSansData) {
    return this.open<void>(this.#infoToCommon(data), extraConfig);
  }

  infoRef(data: InfoDialogData, extraConfig?: MatDialogConfigSansData) {
    return this.openRef<void>(this.#infoToCommon(data), extraConfig);
  }

  confirm(data: ConfirmDialogData, extraConfig?: MatDialogConfigSansData) {
    return this.confirmRef(data, extraConfig)
      .afterClosed()
      .pipe(map(result => result === true));
  }

  confirmRef(data: ConfirmDialogData, extraConfig?: MatDialogConfigSansData) {
    return this.openRef<boolean>(this.#confirmToCommon(data), extraConfig);
  }

  open<T>(data: CommonDialogData, extraConfig?: MatDialogConfigSansData) {
    return this.openRef<T>(data, extraConfig).afterClosed();
  }

  openRef<T>(data: CommonDialogData, extraConfig?: MatDialogConfigSansData): MatDialogRef<CommonDialog, T | undefined> {
    return this.matDialog.open<CommonDialog, CommonDialogData, T | undefined>(
      CommonDialog, {
        data,
        ...extraConfig
      });
  }

  confirmButtonSet(which: ConfirmDialogButtonSet): CommonDialogButton[] {
    const yesNo = which === 'yes_no';
    return [
      {
        label: this.#intl.getLabel(yesNo ? 'noButton' : 'cancelButton'),
        role: 'secondary',
        result: false,
        icon: 'decline',
      },
      {
        label: this.#intl.getLabel(yesNo ? 'yesButton' : 'confirmButton'),
        role: 'primary',
        result: true,
        icon: 'accept',
      }
    ];
  }

  #infoToCommon(data: InfoDialogData): CommonDialogData {
    let ok: CommonDialogButton = {
      label: this.#intl.getLabel('okButton'),
      role: 'secondary',
      result: undefined,
      icon: 'accept',
    };
    if (data.button) {
      if (typeof data.button === 'string' || isSignal(data.button)) {
        ok.label = data.button;
      } else {
        ok = data.button;
      }
    }
    return {
      title: data.title ?? this.#intl.getLabel('infoTitle'),
      content: data.content,
      templateContext: data.templateContext,
      buttons: [ok]
    };
  }

  #confirmToCommon(data: ConfirmDialogData): CommonDialogData {
    const buttons = (!data.buttons || typeof data.buttons === 'string') ?
              this.confirmButtonSet(data.buttons ?? 'yes_no') : data.buttons;
    return {
      title: data.title ?? this.#intl.getLabel('confirmTitle'),
      content: data.content,
      templateContext: data.templateContext,
      buttons
    };
  }

}

export type MatDialogConfigSansData = Omit<MatDialogConfig, 'data'>;
