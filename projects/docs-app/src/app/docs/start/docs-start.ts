import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LIBS } from '../../libs';
import { DocsFeatCard } from '../feat-card/docs-feat-card';

@Component({
  selector: 'app-docs-start',
  imports: [
    RouterLink,
    DocsFeatCard,
  ],
  templateUrl: './docs-start.html',
  styles: `
    :host {
      display: block;
      text-align: center;
    }
  `
})
export class DocsStart {

  protected readonly libs = LIBS;

}
