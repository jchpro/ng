import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { DocsContextService } from '../docs-context.service';
import { DocPage } from '../types';

@Component({
  selector: 'app-docs-menu',
  imports: [
    FaIconComponent,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './docs-menu.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './docs-menu.scss'
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


  protected readonly faClock = faClock;
}
