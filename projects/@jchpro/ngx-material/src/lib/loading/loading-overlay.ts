import { Component, input } from '@angular/core';
import { LoadingOverlayBase } from './loading-overlay-base';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'pro-loading-overlay',
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.scss',
  host: {
    '[class.active]': 'active()',
    '[style.--overlay-z-index]': 'zIndex()',
  }
})
export class LoadingOverlay extends LoadingOverlayBase {

  /**
   * Diameter of the spinner in pixels passed to the `mat-progress-spinner`.
   *
   * @default 80
   */
  readonly diameter = input<number>(80);

}
