import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPalette, faFillDrip, faCircleHalfStroke, faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { THEME_COLOR_OPTIONS, THEME_SCHEME_OPTIONS, ThemeColor, ThemeScheme, ThemesService } from '../../core/services/themes.service';

@Component({
  selector: 'app-docs-theme-selector',
  imports: [
    FaIconComponent,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatTooltip,
    MatMenuTrigger
  ],
  templateUrl: './docs-theme-selector.html',
  styles: ':host { display: inline; }'
})
export class DocsThemeSelector {

  protected colorOptions = THEME_COLOR_OPTIONS;
  protected schemeOptions = THEME_SCHEME_OPTIONS;

  #service = inject(ThemesService);
  protected readonly theme = this.#service.theme;

  protected readonly faPalette = faPalette;
  protected readonly faFillDrip = faFillDrip;
  protected readonly faCircleHalfStroke = faCircleHalfStroke;
  protected readonly faCircle = faCircle;
  protected readonly faCircleDot = faCircleDot;

  protected changeColor(color: ThemeColor) {
    this.#service.change({ ...this.theme(), color });
  }

  protected changeScheme(scheme: ThemeScheme) {
    this.#service.change({ ...this.theme(), scheme });
  }

}
