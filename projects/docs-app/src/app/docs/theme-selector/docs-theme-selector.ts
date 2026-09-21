import { Component, DestroyRef, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPalette, faFillDrip, faCircleHalfStroke, faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { THEME_COLOR_OPTIONS, THEME_SCHEME_OPTIONS, ThemeColor, ThemeScheme, ThemesService } from '../../core/services/themes.service';

@Component({
  selector: 'app-docs-theme-selector',
  imports: [
    FaIconComponent
  ],
  templateUrl: './docs-theme-selector.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './docs-theme-selector.scss'
})
export class DocsThemeSelector {

  protected colorOptions = THEME_COLOR_OPTIONS;
  protected schemeOptions = THEME_SCHEME_OPTIONS;

  #service = inject(ThemesService);
  protected readonly theme = this.#service.theme;

  #host = inject(ElementRef<HTMLElement>).nativeElement;

  protected readonly faPalette = faPalette;
  protected readonly faFillDrip = faFillDrip;
  protected readonly faCircleHalfStroke = faCircleHalfStroke;
  protected readonly faCircle = faCircle;
  protected readonly faCircleDot = faCircleDot;

  constructor() {
    const onDocumentClick = (event: MouseEvent) => {
      if (!this.#host.contains(event.target as Node)) {
        this.#closeAll();
      }
    };
    document.addEventListener('click', onDocumentClick);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('click', onDocumentClick));
  }

  protected changeColor(color: ThemeColor) {
    this.#service.change({ ...this.theme(), color });
    this.#closeAll();
  }

  protected changeScheme(scheme: ThemeScheme) {
    this.#service.change({ ...this.theme(), scheme });
    this.#closeAll();
  }

  #closeAll() {
    this.#host.querySelectorAll('details').forEach((details: HTMLDetailsElement) => details.open = false);
  }

}
