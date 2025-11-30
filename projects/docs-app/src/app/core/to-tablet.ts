import { Directive, inject } from '@angular/core';
import { MediaRangesService } from './services/media-ranges.service';

@Directive({
  host: {
    '[class.to-tablet]': 'toTablet()'
  }
})
export class ToTablet {

  protected readonly toTablet = inject(MediaRangesService).signalState([ 'sm', 'md']);


}
