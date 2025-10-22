import { computed, DOCUMENT, inject, Injectable, Signal, signal } from '@angular/core';
import { LocalStorageService, WINDOW } from '@jchpro/ngx-common';
import { cloneDeep } from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ThemesService {

  #storage = inject(LocalStorageService).getActiveObject<Theme>('theme', {
    color: 'azure',
    scheme: 'system',
  });

  #theme = signal(this.#storage);
  #body = inject(DOCUMENT).body;
  #window = inject(WINDOW);

  constructor() {
    this.#apply(this.theme());
  }

  get theme() {
    return computed(() => cloneDeep(this.#theme()));
  }

  get effectiveScheme(): Signal<ThemeEffectiveScheme> {
    return computed(() => this.theme().scheme === 'system'
      ? (this.#window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : this.#storage.scheme as ThemeEffectiveScheme);
  }

  change(theme: Theme) {
    this.#storage.color = theme.color;
    this.#storage.scheme = theme.scheme;
    this.#theme.set(theme);
    this.#apply(theme);
  }

  #apply(theme: Theme) {
    this.#body.classList.remove('theme', 'dark', 'light', 'azure', 'rose', 'green');
    this.#body.classList.add('theme', theme.scheme, theme.color);
  }

}

export const THEME_COLOR_OPTIONS = [
  { color: 'azure', label: 'Azure & blue' },
  { color: 'rose', label: 'Rose & red' },
  { color: 'green', label: 'Green & yellow' },
] as const;

export const THEME_SCHEME_OPTIONS = [
  { scheme: 'system', label: 'System' },
  { scheme: 'dark', label: 'Dark' },
  { scheme: 'light', label: 'Light'}
] as const;

export type ThemeColor = typeof THEME_COLOR_OPTIONS[number]['color'];
export type ThemeScheme = typeof THEME_SCHEME_OPTIONS[number]['scheme'];
export type ThemeEffectiveScheme = Exclude<ThemeScheme, 'system'>;

export interface Theme {
  color: ThemeColor;
  scheme: ThemeScheme;
}
