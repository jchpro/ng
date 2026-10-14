import { Component, computed, signal } from '@angular/core';
import { LucideCircleAlert, LucideX } from '@lucide/angular';
import { KitColorField } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-forms-text-values',
  imports: [
    CodeExample,
    KitColorField,
    LucideCircleAlert,
    LucideX
  ],
  templateUrl: './text-values.tab.html',
  styleUrl: '../../specimens.scss'
})
export class TextValuesTab {

  protected readonly textTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'];
  protected readonly dateTypes = ['date', 'time', 'datetime-local', 'month', 'week'];
  protected readonly accent = signal<string | null>(null);
  protected readonly link = signal<string | null>(null);
  protected readonly tasks = signal(['Write the intro', 'Review the draft']);
  protected readonly email = signal('');
  protected readonly emailTouched = signal(false);
  protected readonly emailInvalid = computed(() => this.emailTouched() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email()));

  protected add(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && !this.tasks().includes(value)) {
      this.tasks.update(tasks => [...tasks, value]);
    }
    input.value = '';
  }

  protected remove(item: string) {
    this.tasks.update(tasks => tasks.filter(task => task !== item));
  }

}
