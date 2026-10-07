import { Component, computed, signal } from '@angular/core';
import { KitBusy } from '@jchpro/ngx-kit';
import { LucideCircleAlert, LucidePlus } from '@lucide/angular';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-form-controls',
  imports: [
    LibPageTitle,
    CodeExample,
    KitBusy,
    LucideCircleAlert,
    LucidePlus
  ],
  templateUrl: './form-controls.page.html',
  styleUrl: './form-controls.page.scss'
})
export class FormControlsPage {

  protected readonly textTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'];
  protected readonly dateTypes = ['date', 'time', 'datetime-local', 'month', 'week'];
  protected readonly rangeValue = signal(40);
  protected readonly busy = signal(false);
  protected readonly email = signal('');
  protected readonly emailTouched = signal(false);
  protected readonly emailInvalid = computed(() => this.emailTouched() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email()));

  protected onRange(event: Event) {
    this.rangeValue.set(+(event.target as HTMLInputElement).value);
  }

  protected runBusy() {
    this.busy.set(true);
    setTimeout(() => this.busy.set(false), 2000);
  }

}
