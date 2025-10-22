import { Injectable } from '@angular/core';
import { MediaRangesObserverBase, simpleMediaRanges4 } from '@jchpro/ngx-material';

@Injectable({
  providedIn: 'root',
})
export class MediaRangesService extends MediaRangesObserverBase<typeof simpleMediaRanges4> {
  constructor() {
    super(simpleMediaRanges4);
  }
}
