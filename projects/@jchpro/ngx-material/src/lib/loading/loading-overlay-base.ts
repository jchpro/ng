import { Directive } from '@angular/core';
import { input } from '@angular/core';

@Directive()
export abstract class LoadingOverlayBase {

  /**
   * Whether the overlay is active.
   */
  readonly active = input<boolean>(false);

  /**
   * Z-index of the overlay.
   *
   * @default 1001
   */
  readonly zIndex = input<number>();

}
