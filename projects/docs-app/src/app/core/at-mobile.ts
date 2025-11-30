import { Directive, inject } from '@angular/core';
import { MediaRangesService } from './services/media-ranges.service';

@Directive({
  host: {
    '[class.at-mobile]': 'atMobile()'
  }
})
export class AtMobile {

  protected readonly atMobile = inject(MediaRangesService).signalState([ 'sm']);


}
