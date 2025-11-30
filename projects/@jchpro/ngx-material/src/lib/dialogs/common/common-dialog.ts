import { NgTemplateOutlet } from '@angular/common';
import { Component, isSignal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { RenderContent } from '@jchpro/ngx-common';
import { ProIconRenderer } from '../../icons/pro-icon-renderer';
import { DialogBase } from '../dialog-base';
import { CommonDialogButton, CommonDialogData } from '../types';

@Component({
  selector: 'app-common-dialog',
  imports: [
    FormsModule,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    RenderContent,
    ProIconRenderer,
    MatDialogContent,
    NgTemplateOutlet
  ],
  templateUrl: './common-dialog.html'
})
export class CommonDialog extends DialogBase<CommonDialogData, any> {

  protected readonly isSignal = isSignal;
  protected readonly hasNgFormHandler = !!this.data.ngFormSubmit;

  protected onButtonClick(button: CommonDialogButton): void {
    let result: any;
    if (typeof button.result === 'function') {
      result = button.result();
    } else {
      result = button.result;
    }
    this.dialogRef.close(result);
  }

}
