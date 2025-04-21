import { Injectable } from '@angular/core';
import { IntlBase } from './intl-base';
import { DateFormat, DatetimeFormat, TimeFormat } from './intl-config';

/**
 * Base class for date-related mechanisms built on top of `Intl`.
 */
@Injectable()
export class IntlDateBase extends IntlBase {

  protected defaultDateFormat: DateFormat = this.config?.defaults?.dateFormat ?? 'medium';
  protected defaultTimeFormat: TimeFormat = this.config?.defaults?.timeFormat ?? 'medium';
  protected defaultDatetimeFormat: DatetimeFormat = this.config?.defaults?.datetimeFormat ?? `${this.defaultDateFormat}-${this.defaultTimeFormat}`;

  static buildDateTimeFormat(locale?: string, dateFormat?: DateFormat, timeFormat?: TimeFormat): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: dateFormat,
      timeStyle: timeFormat,
    });
  }

}
