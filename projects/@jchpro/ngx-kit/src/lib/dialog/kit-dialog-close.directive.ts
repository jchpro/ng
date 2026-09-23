import { DialogRef } from '@angular/cdk/dialog';
import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Closes the dialog it sits in when clicked, resolving its `result` with the bound value.
 * Always bind a value — a bare attribute resolves with an empty string.
 *
 * ```html
 * <button class="kit-btn kit-btn--ghost" [kitDialogClose]="false">Cancel</button>
 * <button class="kit-btn kit-btn--primary" [kitDialogClose]="user">Save</button>
 * ```
 *
 * A `<button>` without a `type` becomes `type="button"`, so it never submits a form by accident.
 */
@Directive({
  selector: '[kitDialogClose]',
  host: {
    '(click)': 'close()'
  }
})
export class KitDialogClose {

  readonly result = input<unknown>(undefined, { alias: 'kitDialogClose' });

  readonly #ref = inject(DialogRef);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (host instanceof HTMLButtonElement && !host.hasAttribute('type')) {
      host.setAttribute('type', 'button');
    }
  }

  protected close() {
    this.#ref.close(this.result());
  }

}
