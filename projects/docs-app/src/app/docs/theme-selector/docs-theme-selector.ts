import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideCircle, LucideCircleDot, LucideDynamicIcon, LucidePaintBucket } from '@lucide/angular';
import { KitMenu, KitMenuItem, KitMenuTrigger, KitScheme, KitThemeService } from '@jchpro/ngx-kit';
import { THEME_COLOR_OPTIONS, ThemeColor, ThemesService } from '../../core/services/themes.service';

const SCHEME_OPTIONS = [
  { scheme: 'system', label: 'System' },
  { scheme: 'dark', label: 'Dark' },
  { scheme: 'light', label: 'Light' },
] as const satisfies readonly { scheme: KitScheme; label: string }[];

@Component({
  selector: 'app-docs-theme-selector',
  imports: [
    LucideDynamicIcon,
    KitMenu,
    KitMenuItem,
    KitMenuTrigger
  ],
  templateUrl: './docs-theme-selector.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './docs-theme-selector.scss'
})
export class DocsThemeSelector {

  protected colorOptions = THEME_COLOR_OPTIONS;
  protected schemeOptions = SCHEME_OPTIONS;

  #colorService = inject(ThemesService);
  #schemeService = inject(KitThemeService);
  protected readonly color = this.#colorService.color;
  protected readonly scheme = this.#schemeService.scheme;

  protected readonly themeIcon = LucidePaintBucket;
  protected readonly selectedIcon = LucideCircleDot;
  protected readonly unselectedIcon = LucideCircle;

  protected changeColor(color: ThemeColor) {
    this.#colorService.change(color);
  }

  protected changeScheme(scheme: KitScheme) {
    this.#schemeService.set(scheme);
  }

}
