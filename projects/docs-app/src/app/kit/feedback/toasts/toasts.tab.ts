import { Component, inject, signal } from '@angular/core';
import { KitToastService } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-feedback-toasts',
  imports: [
    CodeExample
  ],
  templateUrl: './toasts.tab.html',
  styleUrl: '../../specimens.scss'
})
export class ToastsTab {

  protected readonly toasts = inject(KitToastService);
  protected readonly result = signal('none yet');

  protected async remove() {
    const reason = await this.toasts.info('Item deleted.', { action: 'Undo' }).closed;
    this.result.set(reason);
  }

}
