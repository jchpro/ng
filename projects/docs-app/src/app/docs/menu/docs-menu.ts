import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideClock } from '@lucide/angular';
import { KitShellNavItem, KitShellNavSection } from '@jchpro/ngx-kit';
import { DocsContextService } from '../docs-context.service';
import { DocPage } from '../types';

@Component({
  selector: 'app-docs-menu',
  imports: [
    KitShellNavSection,
    KitShellNavItem
  ],
  templateUrl: './docs-menu.html',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class DocsMenu {

  #context = inject(DocsContextService).context;

  protected readonly lib = computed(() => this.#context().lib);

  protected readonly pages = computed<DocPage[]>(() => {
    const { lib } = this.#context();
    if (!lib) {
      return [];
    }
    return lib.pages;
  });

  protected readonly moreIcon = LucideClock;

}
