import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

/**
 * Defaults for all mechanisms based on browser's `Intl` implementation.
 */
export interface IntlConfig {

  /**
   * Locale, if not provided defaults to `navigator.language`.
   */
  locale?: string;

  /**
   * Default values for various mechanisms.
   */
  defaults?: {

    /**
     * Default date format, if not provided "medium" will be used.
     */
    dateFormat?: DateFormat;

    /**
     * Default time format, if not provided "medium" will be used.
     */
    timeFormat?: TimeFormat;

    /**
     * Default datetime format, if not provided combined date & time formats will be used.
     */
    datetimeFormat?: DatetimeFormat;
  };
}

/**
 * Injection token for mechanism base on `Intl`, provided with {@link provideIntlConfig}.
 */
export const INTL_CONFIG = new InjectionToken<IntlConfig>('INTL_CONFIG');

/**
 * Provides {@link INTL_CONFIG} globally, optional.
 */
export function provideIntlConfig(config: IntlConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: INTL_CONFIG,
      useValue: config
    }
  ]);
}

/**
 * Date format, equals to the `Intl.DateTimeFormatOptions.dateStyle`, but non-nullable.
 */
export type DateFormat = NonNullable<Intl.DateTimeFormatOptions['dateStyle']>;

/**
 * Time format, equals to the `Intl.DateTimeFormatOptions.timeStyle`, but non-nullable.
 */
export type TimeFormat = NonNullable<Intl.DateTimeFormatOptions['timeStyle']>;

/**
 * Combined {@link DateFormat} and {@link TimeFormat}, joined with hyphen.
 */
export type DatetimeFormat = `${DateFormat}-${TimeFormat}`;

