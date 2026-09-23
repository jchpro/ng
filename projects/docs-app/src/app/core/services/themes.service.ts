import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '@jchpro/ngx-common';

/**
 * The dark/light/system scheme itself is owned by `KitThemeService` from `@jchpro/ngx-kit`.
 * This service only manages the docs-app-only accent hue layered on top of it.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemesService {

  #storage = inject(LocalStorageService);
  #body = inject(DOCUMENT).body;
  #color = signal(this.#storage.get<ThemeColor>('theme.color', 'jchPRO'));

  constructor() {
    this.#apply(this.#color());
  }

  get color() {
    return this.#color.asReadonly();
  }

  change(color: ThemeColor) {
    this.#storage.set('theme.color', color);
    this.#color.set(color);
    this.#apply(color);
  }

  #apply(color: ThemeColor) {
    this.#body.classList.remove('azure-color', 'green-color');
    if (color === 'jchPRO') {
      return;
    }
    this.#body.classList.add(`${color}-color`);
  }

}

export const THEME_COLOR_OPTIONS = [
  { color: 'jchPRO', label: 'jchPRO' },
  { color: 'azure', label: 'Azure & blue' },
  { color: 'green', label: 'Green & yellow' },
] as const;

export type ThemeColor = typeof THEME_COLOR_OPTIONS[number]['color'];
