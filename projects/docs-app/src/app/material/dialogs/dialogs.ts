import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { CommonDialogsService } from '@jchpro/ngx-material';
import { CodeCopyDirective } from '../../docs/code-example/code-copy';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-dialogs',
  imports: [
    LibPageTitle,
    MatButton,
    CodeCopyDirective,
    CodeExample,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatHint
  ],
  templateUrl: './dialogs.html',
  styleUrl: './dialogs.scss',
})
export class Dialogs {

  protected readonly dialogsService= inject(CommonDialogsService);

  protected readonly form = new FormGroup({
    title: new FormControl('Dialog', { nonNullable: true, validators: Validators.required }),
    content: new FormControl('Hello world!', { nonNullable: true, validators: Validators.required }),
    primaryLabel: new FormControl('OK', { nonNullable: true, validators: Validators.required }),
    secondaryLabel: new FormControl('Cancel', { nonNullable: true, validators: Validators.required })
  });

  onOpenInfoClick() {
    this.dialogsService.info({
      content: 'Hello world!',
    });
  }

  onOpenConfirmClick() {
    this.dialogsService.confirm({
      content: 'Do you confirm the action?',
      buttons: 'confirm_cancel'
    });
  }

  onOpenCustomClick() {
    const { title, content, primaryLabel, secondaryLabel } = this.form.value;
    this.dialogsService.open({
      title: title!,
      content: content!,
      buttons: [
        { label: secondaryLabel!, role: 'secondary', result: false },
        { label: primaryLabel!, role: 'primary', result: true },
      ]
    });
  }
}
