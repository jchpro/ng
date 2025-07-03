import { Directive, inject, ViewContainerRef } from '@angular/core';
import { PicoDialogOutletService } from './pico-dialog-outlet.service';

/**
 * Insert one instance as structure directive on <ng-container> somewhere top-level in your app,
 * usually inside <app-root>. This is where dialogs will be rendered.
 *
 * @example
 * ```html
 * <ng-container *picoDialogOutlet></ng-container>
 * ```
 */
@Directive({
  selector: '[picoDialogOutlet]',
})
export class PicoDialogOutletDirective {

  constructor() {
    const outletService = inject(PicoDialogOutletService);
    outletService.register(inject(ViewContainerRef));
  }

}
