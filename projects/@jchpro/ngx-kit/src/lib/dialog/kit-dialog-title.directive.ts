import { afterNextRender, Directive, ElementRef, inject } from '@angular/core';

let nextTitleId = 0;

/**
 * Marks the heading that names a dialog: gives it the kit's title style and wires it up as the
 * dialog's accessible name (`aria-labelledby` on the dialog element), so no id needs passing
 * around.
 *
 * ```html
 * <h2 kitDialogTitle>Edit user</h2>
 * ```
 */
@Directive({
  selector: '[kitDialogTitle]',
  host: {
    'class': 'kit-dialog__title',
    '[attr.id]': 'id'
  }
})
export class KitDialogTitle {

  protected readonly id = `kit-dialog-title-${nextTitleId++}`;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      host.closest('[role="dialog"], [role="alertdialog"]')?.setAttribute('aria-labelledby', this.id);
    });
  }

}
