import { Component, inject } from '@angular/core';
import { DocsContextService } from '../docs-context.service';

@Component({
  selector: 'h1[lib-page-title]',
  imports: [],
  templateUrl: './lib-page-title.html',
  host: {
    'class': 'flex row m-between x-center'
  },
  styles: `:host { line-height: 1.1; } .lib-name { font-size: 75%; }`
})
export class LibPageTitle {

  readonly context = inject(DocsContextService).context;

}
