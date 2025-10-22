import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MediaRangesService } from '../../core/services/media-ranges.service';
import { DocsFeatCard } from '../feat-card/docs-feat-card';
import { DocLib } from '../types';

@Component({
  selector: 'app-lib-page-cards',
  imports: [
    DocsFeatCard,
    RouterLink
  ],
  templateUrl: './lib-page-cards.html',
  styleUrl: './lib-page-cards.scss',
  host: {
    '[class.is-mobile]': 'isMobile()'
  }
})
export class LibPageCards {

  readonly lib = input<DocLib>();
  readonly isMobile = inject(MediaRangesService).signalState(['sm', 'md']);

}
