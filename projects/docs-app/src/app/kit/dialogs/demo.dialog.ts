import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { KitDialogClose, KitDialogTitle } from '@jchpro/ngx-kit';

export interface DemoDialogData {
  name: string;
  lines: number;
}

/** Example of a dialog of your own, laid out with the kit-dialog classes. */
@Component({
  selector: 'app-demo-dialog',
  imports: [KitDialogTitle, KitDialogClose],
  templateUrl: './demo.dialog.html',
  host: {
    'class': 'kit-dialog'
  }
})
export class DemoDialog {

  protected readonly data = inject<DemoDialogData>(DIALOG_DATA);
  protected readonly name = signal(this.data.name);
  protected readonly lines = Array.from({ length: this.data.lines }, (_, index) => index + 1);

  protected onName(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
  }

}
