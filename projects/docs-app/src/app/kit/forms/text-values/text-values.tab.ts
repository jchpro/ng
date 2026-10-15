import { Component, computed, signal } from '@angular/core';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
import { LucideCircleAlert } from '@lucide/angular';
import { KitChipInput, KitColorField, KitFieldError } from '@jchpro/ngx-kit';
import { CodeExample } from '../../../docs/code-example/code-example';

@Component({
  selector: 'app-forms-text-values',
  imports: [
    CodeExample,
    FormField,
    KitChipInput,
    KitColorField,
    KitFieldError,
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
  protected readonly tags = signal<string[]>([]);
  protected readonly tasksModel = signal({ tasks: ['Write the intro', 'Review the draft'] });
  protected readonly tasksForm = form(this.tasksModel, path => {
    maxLength(path.tasks, 3);
    validate(path.tasks, ({ value }) => new Set(value()).size === value().length ? undefined : { kind: 'duplicate' });
  });
  protected readonly email = signal('');
  protected readonly emailTouched = signal(false);
  protected readonly emailInvalid = computed(() => this.emailTouched() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email()));

}
