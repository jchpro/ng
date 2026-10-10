import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { email, form, FormField, minLength, required, submit, validate } from '@angular/forms/signals';
import { KitFieldError, resetKitForm } from '@jchpro/ngx-kit';
import { CodeExample } from '../../docs/code-example/code-example';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

const EMPTY = { name: '', email: '', nickname: '' };

@Component({
  selector: 'app-forms',
  imports: [
    LibPageTitle,
    CodeExample,
    FormField,
    KitFieldError
  ],
  templateUrl: './forms.page.html'
})
export class FormsPage {

  protected readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');
  protected readonly saved = signal(false);

  protected readonly model = signal({ ...EMPTY });
  protected readonly form = form(this.model, path => {
    required(path.name);
    minLength(path.name, 3);
    required(path.email);
    email(path.email);
    // A custom kind: its text comes from [messages]
    validate(path.nickname, ({ value }) => value().toLowerCase() === 'admin' ? { kind: 'reserved' } : undefined);
  });

  protected readonly messages = { reserved: 'This nickname is reserved.' };

  protected async onSubmit(event: Event) {
    event.preventDefault();
    this.saved.set(false);
    await submit(this.form, async () => {
      this.saved.set(true);
      return undefined;
    });
  }

  protected reset() {
    resetKitForm(this.form, this.formElement(), { ...EMPTY });
    this.saved.set(false);
  }

}
