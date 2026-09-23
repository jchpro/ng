import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DocsContextService } from '../../docs/docs-context.service';
import { LibPageCards } from '../../docs/lib-page-cards/lib-page-cards';
import { LibPageTitle } from '../../docs/page-title/lib-page-title';

@Component({
  selector: 'app-kit-start-page',
  imports: [
    LibPageTitle,
    LibPageCards
  ],
  templateUrl: './kit-start-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './kit-start-page.scss',
})
export class KitStartPage {

  readonly #context = inject(DocsContextService).context;

  protected readonly lib = computed(() => this.#context().lib);

}
