import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TitleService } from '@jchpro/ngx-common';
import { KitShell, KitShellHeader, KitShellNavItem, KitShellRoot, KitShellSidenav, KitThemeService } from '@jchpro/ngx-kit';
import { ThemesService } from './core/services/themes.service';
import { DocsContextService } from './docs/docs-context.service';
import { DocsMenu } from './docs/menu/docs-menu';
import { DocsThemeSelector } from './docs/theme-selector/docs-theme-selector';
import { LIBS } from './libs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    KitShell,
    KitShellHeader,
    KitShellSidenav,
    KitShellNavItem,
    DocsMenu,
    DocsThemeSelector
  ],
  hostDirectives: [
    KitShellRoot
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App {

  #titleService = inject(TitleService);
  #kitThemeService = inject(KitThemeService);
  #themesService = inject(ThemesService);

  protected readonly libs = LIBS;
  protected readonly hasMenu = inject(DocsContextService).hasMenu;

}
