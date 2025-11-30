import { Component, computed, inject } from '@angular/core';
import { CodeExample } from '../../docs/code-example/code-example';
import { DocsContextService } from '../../docs/docs-context.service';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-material-start-page',
  imports: [
    LibPageTitle,
    CodeExample
  ],
  templateUrl: './admin-start-page.html',
  styleUrl: './admin-start-page.scss',
})
export class AdminStartPage {

  readonly #context = inject(DocsContextService).context;

  protected readonly lib = computed(() => this.#context().lib);

}
