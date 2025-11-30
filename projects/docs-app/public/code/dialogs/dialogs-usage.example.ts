import { Component, inject, signal } from '@angular/core';
import { CommonDialogsService } from '@jchpro/ngx-material';

@Component({
  selector: 'dialogs-usage-example',
  template: ''
})
export class DialogsUsageExample {

  private readonly service = inject(CommonDialogsService);

  openInfoDialog() {

    // Displays a dialog and returns an Observable `.afterClosed()`
    this.service.info({
      content: 'Hello world!',
      // title: 'Information',            // Optional
      // templateContext: { foo: 'bar' }, // When passing `TemplateRef` as content
      // button: 'Done',                  // Can be a Signal<string> or `CommonDialogButton`
    }, {
      disableClose: true,                 // 2nd parameter is passed is `MatDialogConfig` without the `data` field
    });

    // Displays a dialog and returns `DialogRef`
    // this.service.infoRef({
    //   content: 'Do you confirm the action?',
    // });
  }

  openConfirmDialog() {
    this.service.confirm({
      content: 'Do you confirm the action?',
      // buttons: 'confirm_cancel'        // Can be predefined `ConfirmDialogButtonSet` or `CommonDialogButton[]`
    });
  }

  openAnyDialog() {
    this.service.open({
      title: 'Custom dialog',
      content: 'Hello world!',
      primaryDisabled: signal(false),
      ngFormSubmit: () => console.log('Form submitted'),
      buttons: [
        { label: 'Cancel', role: 'secondary', result: false },
        { label: 'OK', role: 'primary', result: true },
      ]
    });
  }

}
