import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { MediaRangesService } from '../core/services/media-ranges.service';
import { LIBS } from '../libs';
import { DocsContextService } from './docs-context.service';
import { DocsMenu } from './menu/docs-menu';
import { DocsThemeSelector } from './theme-selector/docs-theme-selector';

@Component({
  selector: 'app-docs',
  imports: [
    FaIconComponent,
    RouterOutlet,
    DocsMenu,
    DocsThemeSelector,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './docs.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './docs.scss'
})
export class Docs {

  protected readonly faBars = faBars;
  protected readonly libs = LIBS;

  readonly #hasMenu = inject(DocsContextService).hasMenu;

  protected readonly mobileLayout = inject(MediaRangesService).signalState(['sm', 'md']);

  protected readonly sidebarState = computed<'hidden' | 'visible' | 'toggle'>(() => {
    if (!this.#hasMenu()) {
      return 'hidden';
    }
    return this.mobileLayout() ? 'toggle' : 'visible';
  });

  protected readonly sidebarOpened = signal(false);

  protected toggleSidebar() {
    this.sidebarOpened.update(opened => !opened);
  }

  protected closeSidebar() {
    this.sidebarOpened.set(false);
  }

}
