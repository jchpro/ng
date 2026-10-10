import { ElementRef } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';

/**
 * Resets a Signal Forms form to its starting state — or to `value` — and the native `<form>` it is bound to.
 *
 * `form().reset()` clears what Signal Forms knows (touched, dirty, the value), but not what the browser keeps for itself:
 * the fields the person has been in. An emptied `required` field stays `:user-invalid` (red) until the native form is reset too.
 *
 * ```ts
 * protected readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');
 * … resetKitForm(this.form, this.formElement(), { oldPassword: '', newPassword: '' });
 * ```
 */
export function resetKitForm<T>(form: FieldTree<T>, element: HTMLFormElement | ElementRef<HTMLFormElement>, value?: T): void {
  // The native reset first: it empties every control, and the reset of the form then writes its values back
  (element instanceof ElementRef ? element.nativeElement : element).reset();
  (form() as { reset(value?: T): void }).reset(value);
}
