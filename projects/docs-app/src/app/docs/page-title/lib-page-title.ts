import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsContextService } from '../docs-context.service';
import { LibVersion } from '../lib-version/lib-version';

@Component({
  selector: 'header[lib-page-title]',
  imports: [RouterLink, LibVersion],
  templateUrl: './lib-page-title.html',
  host: {
    'class': 'kit-page-header'
  },
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LibPageTitle {

  readonly context = inject(DocsContextService).context;

}
