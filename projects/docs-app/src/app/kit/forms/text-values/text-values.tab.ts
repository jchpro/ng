import { Component, computed, signal } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { KitColorField } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-forms-text-values',
  imports: [
    CodeExample,
    KitColorField,
    LucideCircleAlert
  ],
  templateUrl: './text-values.tab.html',
  styleUrl: '../../specimens.scss'
})
export class TextValuesTab {

  protected readonly textTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'];
  protected readonly dateTypes = ['date', 'time', 'datetime-local', 'month', 'week'];
  protected readonly accent = signal<string | null>(null);
  protected readonly link = signal<string | null>(null);
  protected readonly email = signal('');
  protected readonly emailTouched = signal(false);
  protected readonly emailInvalid = computed(() => this.emailTouched() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email()));

}
