import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToTablet } from '../../core/to-tablet';
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
  hostDirectives: [
    ToTablet
  ]
})
export class LibPageCards {

  readonly lib = input<DocLib>();

}
