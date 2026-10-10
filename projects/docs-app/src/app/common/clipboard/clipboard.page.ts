import { Component, inject, signal } from '@angular/core';
import { ClipboardService } from '@jchpro/ngx-common';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-clipboard',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './clipboard.page.html'
})
export class ClipboardPage {

  readonly #clipboard = inject(ClipboardService);

  protected readonly text = 'https://ng.jchpro.pl';
  protected readonly result = signal<'copied' | 'refused' | null>(null);

  protected async copy() {
    this.result.set(await this.#clipboard.copy(this.text) ? 'copied' : 'refused');
  }

}
