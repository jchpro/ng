import { Component, inject, signal } from '@angular/core';
import { KitBusy, KitLoadingService } from '@jchpro/ngx-kit';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-loading',
  imports: [
    LibPageTitle,
    CodeExample,
    KitBusy
  ],
  templateUrl: './loading.page.html'
})
export class LoadingPage {

  readonly #loading = inject(KitLoadingService);

  protected readonly saving = signal(false);
  protected readonly panelLoading = signal(false);

  protected async saveDemo() {
    this.saving.set(true);
    await this.#wait();
    this.saving.set(false);
  }

  protected async panelDemo() {
    this.panelLoading.set(true);
    await this.#wait();
    this.panelLoading.set(false);
  }

  protected globalDemo() {
    return this.#loading.track(this.#wait(2500));
  }

  #wait(ms = 2000) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

}
