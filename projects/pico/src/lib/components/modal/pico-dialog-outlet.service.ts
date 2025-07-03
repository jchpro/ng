import { Injectable, ViewContainerRef } from '@angular/core';

/**
 * Stores `ViewContainerRef` from {@link PicoDialogOutletDirective} for {@link PicoDialogService}.
 * For internal usage.
 */
@Injectable({
  providedIn: 'root'
})
export class PicoDialogOutletService {

  private ref?: ViewContainerRef;

  register(viewContainerRef: ViewContainerRef) {
    if (this.ref) {
      return;
    }
    this.ref = viewContainerRef;
  }

  get viewContainer(): ViewContainerRef {
    if (!this.ref) {
      throw new Error('<pico-dialog-outlet> not added to template DOM');
    }
    return this.ref;
  }

}
