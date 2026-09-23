import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsContextService } from '../docs-context.service';

@Component({
  selector: 'header[lib-page-title]',
  imports: [RouterLink],
  templateUrl: './lib-page-title.html',
  host: {
    'class': 'kit-page-header'
  },
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LibPageTitle {

  readonly context = inject(DocsContextService).context;

}
