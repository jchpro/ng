import { inject, Injectable, Injector, runInInjectionContext, signal, Signal } from '@angular/core';
import { WINDOW } from '../tokens/window';
import { DateFormat, DatetimeFormat, INTL_CONFIG, IntlConfig } from './intl-config';

@Injectable({
  providedIn: 'root',
})
export class IntlService {

  #config = inject(INTL_CONFIG, { optional: true }) ?? undefined;
  #window = inject(WINDOW);

  readonly locale: Signal<string>;
  readonly defaultDateFormat = IntlService.defaultDateFormat(this.#config);
  readonly defaultTimeFormat = IntlService.defaultTimeFormat(this.#config);
  readonly defaultDatetimeFormat = IntlService.defaultDatetimeFormat(this.#config);

  #injector = inject(Injector);

  constructor() {
    this.locale = this.#initLocaleSignal();
  }

  #initLocaleSignal(): Signal<string> {
    if (!this.#config?.locale) {
      return signal(this.browserLocale()).asReadonly();
    }
    if (typeof this.#config.locale === 'string') {
      return signal(this.#config.locale).asReadonly();
    }
    return runInInjectionContext(this.#injector, this.#config.locale);
  }

  /**
   * Returns the browser's locale ID from `navigator.language`.
   * When passed `true` returns `Intl.Locale` instance.
   */
  browserLocale(): string;
  browserLocale(instance: true): Intl.Locale;
  browserLocale(instance?: true): string | Intl.Locale {
    const localeId = this.#window.navigator.language;
    return instance ? new Intl.Locale(localeId) : localeId;
  }

  static defaultDateFormat(intlConfig?: IntlConfig): DateFormat {
    return intlConfig?.defaults?.dateFormat ?? 'medium';
  }

  static defaultTimeFormat(intlConfig?: IntlConfig): DateFormat {
    return intlConfig?.defaults?.timeFormat ?? 'medium';
  }

  static defaultDatetimeFormat(intlConfig?: IntlConfig): DatetimeFormat {
    return intlConfig?.defaults?.datetimeFormat ?? `${this.defaultDateFormat(intlConfig)}-${this.defaultTimeFormat(intlConfig)}`;
  }

}
