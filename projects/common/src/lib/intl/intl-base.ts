import { inject, Injectable } from '@angular/core';
import { WINDOW } from '../tokens/window';
import { INTL_CONFIG } from './intl-config';

/**
 * Base class for mechanism built on top of `Intl`.
 */
@Injectable()
export class IntlBase {

  protected readonly config = inject(INTL_CONFIG, { optional: true });
  protected readonly window = inject(WINDOW);

  protected effectiveLocale(locale?: string): string {
    return locale ?? this.config?.locale ?? this.browserLocale();
  }

  protected browserLocale(): string;
  protected browserLocale(instance: true): Intl.Locale;
  protected browserLocale(instance?: true): string | Intl.Locale {
    const localeId = this.window.navigator.language;
    return instance ? new Intl.Locale(localeId) : localeId;
  }

}
