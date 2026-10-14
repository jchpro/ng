import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LibPageTitle } from '../page-title/lib-page-title';
import { DocPage } from '../types';

/** A docs page made of tabs: the title, the `kit-tabs` row and the outlet of the tab's route. */
@Component({
  selector: 'app-docs-tabbed-page',
  imports: [
    LibPageTitle,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  template: `
    <header lib-page-title></header>
    <nav class="kit-tabs" [attr.aria-label]="page.fullName + ' sections'">
      @for (tab of page.tabs; track tab.path) {
        <a class="kit-tabs__link" [routerLink]="tab.path" routerLinkActive ariaCurrentWhenActive="page">{{ tab.label }}</a>
      }
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: `
    .kit-tabs {
      margin-bottom: var(--kit-space-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager
})
export class DocsTabbedPage {

  protected readonly page: DocPage = inject(ActivatedRoute).snapshot.data['page'];

}
