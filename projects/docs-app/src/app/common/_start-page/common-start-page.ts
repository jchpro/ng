import { Component, computed, inject } from '@angular/core';
import { DocsContextService } from '../../docs/docs-context.service';
import { LibPageCards } from '../../docs/lib-page-cards/lib-page-cards';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-common-start-page',
  imports: [
    LibPageTitle,
    LibPageCards
  ],
  templateUrl: './common-start-page.html',
  styleUrl: './common-start-page.scss',
})
export class CommonStartPage {

  readonly #context = inject(DocsContextService).context;

  protected readonly lib = computed(() => this.#context().lib);

}
