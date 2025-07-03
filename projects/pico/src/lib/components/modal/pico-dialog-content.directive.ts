import { Directive, inject, TemplateRef } from '@angular/core';
import { PicoDialogHostComponent } from './pico-dialog-host.component';

/**
 * Wrap your dialog component contents with `<ng-container *picoDialogContent></ng-container>`.
 * Ensures consistency for rendering template and component dialogs.
 */
@Directive({
  selector: '[picoDialogContent]',
})
export class PicoDialogContentDirective {

  readonly templateRef = inject(TemplateRef);

  protected readonly host = inject(PicoDialogHostComponent);

  constructor() {
    this.host.attachContentFromDirective(this.templateRef);
  }

}
