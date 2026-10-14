import { Component, signal } from '@angular/core';
import { KitBusy } from '@jchpro/ngx-kit';
import { LucidePlus } from '@lucide/angular';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-foundations-buttons',
  imports: [
    CodeExample,
    KitBusy,
    LucidePlus
  ],
  templateUrl: './buttons.tab.html',
  styleUrl: '../../specimens.scss'
})
export class ButtonsTab {

  protected readonly busy = signal(false);

  protected runBusy() {
    this.busy.set(true);
    setTimeout(() => this.busy.set(false), 2000);
  }

}
