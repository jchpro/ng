import { Component, input } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { LoadingOverlayBase } from './loading-overlay-base';

@Component({
  selector: 'pro-global-loading-indicator',
  imports: [
    MatProgressBar
  ],
  templateUrl: './global-loading-indicator.html',
  styleUrl: './global-loading-indicator.scss',
  host: {
    '[class.position-bottom]': 'position() === "bottom"',
    '[style.--indicator-z-index]': 'zIndex()',
    '[style.--indicator-transition-time]': 'transitionTime()',
  }
})
export class GlobalLoadingIndicator extends LoadingOverlayBase {

  /**
   * Position of the indicator.
   */
  readonly position = input<'top' | 'bottom'>('top');

  /**
   * CSS transition time for the indicator in ms.
   *
   * @default 300
   */
  readonly transitionTime = input<number>();


}
