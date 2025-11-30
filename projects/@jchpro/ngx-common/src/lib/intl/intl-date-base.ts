import { Injectable } from '@angular/core';
import { IntlBase } from './intl-base';
import { DateFormat, TimeFormat } from './intl-config';
import { IntlService } from './intl.service';

/**
 * Base class for date-related mechanisms built on top of `Intl`.
 */
@Injectable()
export class IntlDateBase extends IntlBase {

  protected defaultDateFormat = IntlService.defaultDateFormat(this.config);
  protected defaultTimeFormat = IntlService.defaultTimeFormat(this.config)
  protected defaultDatetimeFormat = IntlService.defaultDatetimeFormat(this.config);

  static buildDateTimeFormat(locale: string, dateFormat?: DateFormat, timeFormat?: TimeFormat): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: dateFormat,
      timeStyle: timeFormat,
    });
  }

}
