import { Component, inject, signal } from '@angular/core';
import { KitDialogService, KitDialogTone } from '@jchpro/ngx-kit';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';
import { DemoDialog, DemoDialogData } from './demo.dialog';

@Component({
  selector: 'app-dialogs',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './dialogs.page.html'
})
export class DialogsPage {

  readonly #dialogs = inject(KitDialogService);

  protected readonly tones: KitDialogTone[] = ['info', 'success', 'warning', 'error'];
  protected readonly lastResult = signal('nothing yet');

  protected async alert(tone: KitDialogTone) {
    await this.#dialogs.alert({ tone, message: `A message with the ${tone} tone.\nLine breaks are kept.` });
    this.lastResult.set(`${tone} alert dismissed`);
  }

  protected async confirm() {
    const confirmed = await this.#dialogs.confirm({ message: 'Publish the page?' });
    this.lastResult.set(`confirm: ${confirmed}`);
  }

  protected async confirmDanger() {
    const confirmed = await this.#dialogs.confirm({
      tone: 'danger',
      buttons: 'yes-no',
      message: 'Delete the user? This can\'t be undone.',
      title: 'Delete user'
    });
    this.lastResult.set(`danger confirm: ${confirmed}`);
  }

  protected async openCustom(lines: number, size: 'md' | 'lg') {
    const result = await this.#dialogs.open<string, DemoDialogData, DemoDialog>(DemoDialog, {
      data: { name: 'Ada Lovelace', lines },
      size
    }).result;
    this.lastResult.set(`custom dialog: ${result === undefined ? 'dismissed' : `saved "${result}"`}`);
  }

}
