import { Component, computed, inject } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { DocsContextService } from '../../docs/docs-context.service';
import { LibPageCards } from '../../docs/lib-page-cards/lib-page-cards';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-material-start-page',
  imports: [
    LibPageTitle,
    LibPageCards,
    CodeExample
  ],
  templateUrl: './material-start-page.html',
  styleUrl: './material-start-page.scss',
})
export class MaterialStartPage {

  readonly #context = inject(DocsContextService).context;

  protected readonly lib = computed(() => this.#context().lib);

}
